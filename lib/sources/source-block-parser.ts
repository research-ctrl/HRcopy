/**
 * Plain-text source block parser.
 *
 * Each source is defined as a YAML-like block, separated by lines that
 * contain only "---". Blank lines inside a block are ignored.
 *
 * Example format:
 *
 *   ---
 *   name: DRE — Diário da República Eletrónico
 *   authority: Binding law
 *   url: https://dre.pt
 *   topics: labour code, decrees, ordinances, amendments
 *   refresh: daily
 *   priority: 1
 *   allowlist: true
 *   notes: Primary source of Portuguese binding law.
 *   ---
 */

import type { UpsertSourceRequest } from "@/lib/domain/models/source";

export interface ParsedSourceBlock {
  /** Fields parsed successfully */
  source: UpsertSourceRequest;
  /** Any warnings / unknown keys found during parsing */
  warnings: string[];
  /** Raw text of this block (for round-trip display) */
  raw: string;
}

export interface ParseResult {
  blocks: ParsedSourceBlock[];
  /** Fatal parse errors per block index */
  errors: Array<{ blockIndex: number; message: string }>;
}

const VALID_REFRESH = ["daily", "weekly", "manual"] as const;
const VALID_PARSER  = ["html", "rss", "sitemap", "manual"] as const;
const VALID_STATUS  = ["active", "inactive", "draft"] as const;

function normalizeKey(k: string): string {
  return k.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

/** Convert a ParsedSourceBlock array back into the canonical text format. */
export function sourcesToBlockText(sources: Array<{
  name: string;
  url: string;
  notes: string;
  refreshFrequency: string;
  priority: number;
  allowlisted: boolean;
  status: string;
  parserType?: string;
  // optional enrichment fields stored in notes
}>): string {
  if (!sources.length) return defaultBlockText();

  return sources
    .map((s) => {
      // Pull "authority:" and "topics:" back out of notes if present
      const authorityMatch = s.notes.match(/^Authority:\s*(.+?)(?:\n|$)/im);
      const topicsMatch    = s.notes.match(/^Topics:\s*(.+?)(?:\n|$)/im);
      const cleanNotes = s.notes
        .replace(/^Authority:\s*.+?\n?/im, "")
        .replace(/^Topics:\s*.+?\n?/im, "")
        .trim();

      const lines = [
        `name: ${s.name}`,
        authorityMatch ? `authority: ${authorityMatch[1].trim()}` : null,
        `url: ${s.url}`,
        topicsMatch    ? `topics: ${topicsMatch[1].trim()}` : null,
        `refresh: ${s.refreshFrequency}`,
        `priority: ${s.priority}`,
        `allowlist: ${s.allowlisted}`,
        `status: ${s.status}`,
        cleanNotes     ? `notes: ${cleanNotes}` : null,
      ].filter(Boolean);

      return `---\n${lines.join("\n")}\n`;
    })
    .join("\n");
}

export function defaultBlockText(): string {
  return `---
name: DRE — Diário da República Eletrónico
authority: Binding law
url: https://dre.pt
topics: labour code, decrees, ordinances, collective agreements
refresh: daily
priority: 1
allowlist: true
notes: Primary source of Portuguese binding law. Always check before answering questions about the Código do Trabalho.

---
name: ACT — Autoridade para as Condições do Trabalho
authority: Labour regulator
url: https://www.act.gov.pt
topics: labour inspection, working time, collective bargaining, OSH, dismissal procedures
refresh: weekly
priority: 2
allowlist: true
notes: Operational guidance for HR compliance. Use for procedural questions about dismissals, leave, and working conditions.

---
name: Segurança Social
authority: Social security authority
url: https://www.seg-social.pt
topics: social security, contributions, onboarding, declarations, parental benefits
refresh: weekly
priority: 2
allowlist: true
notes: Covers employee registration, contribution tables, and social security procedures.

---
name: Portal das Finanças
authority: Tax authority
url: https://www.portaldasfinancas.gov.pt
topics: payroll tax, withholding tables, IRS, DMR, tax declarations
refresh: weekly
priority: 2
allowlist: true
notes: Payroll withholding tables and tax obligations for employers.

---
name: gov.pt
authority: Government services portal
url: https://www.gov.pt
topics: government services, official guidance, HR procedures, employment
refresh: weekly
priority: 3
allowlist: true
notes: Portuguese government service navigation layer.

---
name: CITE — Comissão para a Igualdade no Trabalho
authority: Equality regulator
url: https://cite.gov.pt
topics: equality, gender, parentality, discrimination, maternity, paternity
refresh: weekly
priority: 3
allowlist: true
notes: Covers equality in employment, parental rights, and discrimination procedures.

---
name: CNPD — Comissão Nacional de Proteção de Dados
authority: Data protection authority
url: https://www.cnpd.pt
topics: employee privacy, data protection, GDPR, monitoring, biometric data
refresh: monthly
priority: 3
allowlist: true
notes: Governs employer obligations under GDPR for employee personal data.

---
name: AIMA — Agência para a Integração, Migrações e Asilo
authority: Immigration authority
url: https://www.aima.gov.pt
topics: foreign workers, work permits, immigration, visa, residence
refresh: weekly
priority: 3
allowlist: true
notes: Workflows for hiring non-EU workers, permits, and residence authorizations.

---
name: IEFP — Instituto do Emprego e Formação Profissional
authority: Employment authority
url: https://www.iefp.pt
topics: hiring incentives, employment supports, apprenticeship, training, subsidies
refresh: weekly
priority: 4
allowlist: true
notes: Hiring incentives and employment support programmes for Portuguese employers.
`;
}

/** Parse the full text area content into source blocks. */
export function parseBlockText(text: string): ParseResult {
  const blocks: ParsedSourceBlock[] = [];
  const errors: ParseResult["errors"] = [];

  // Split on lines that are exactly "---" (trimmed)
  const rawBlocks = text
    .split(/^---\s*$/m)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  rawBlocks.forEach((raw, idx) => {
    const warnings: string[] = [];
    const fields: Record<string, string> = {};

    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const colon = trimmed.indexOf(":");
      if (colon === -1) {
        warnings.push(`Line ignored (no colon): "${trimmed}"`);
        continue;
      }
      const key = normalizeKey(trimmed.slice(0, colon));
      const val = trimmed.slice(colon + 1).trim();
      fields[key] = val;
    }

    // Required fields
    if (!fields["name"]) {
      errors.push({ blockIndex: idx, message: `Block ${idx + 1}: missing required field "name"` });
      return;
    }
    if (!fields["url"]) {
      errors.push({ blockIndex: idx, message: `Block ${idx + 1}: missing required field "url"` });
      return;
    }

    // priority
    const rawPriority = parseInt(fields["priority"] ?? "3", 10);
    const priority = (isNaN(rawPriority) || rawPriority < 1 || rawPriority > 5)
      ? (warnings.push("priority must be 1–5, defaulting to 3"), 3)
      : rawPriority as 1 | 2 | 3 | 4 | 5;

    // refresh
    const rawRefresh = (fields["refresh"] ?? "weekly").toLowerCase();
    const refreshFrequency = VALID_REFRESH.includes(rawRefresh as never)
      ? (rawRefresh as typeof VALID_REFRESH[number])
      : (warnings.push(`Unknown refresh "${rawRefresh}", defaulting to weekly`), "weekly" as const);

    // parser
    const rawParser = (fields["parsertype"] ?? fields["parser"] ?? "html").toLowerCase();
    const parserType = VALID_PARSER.includes(rawParser as never)
      ? (rawParser as typeof VALID_PARSER[number])
      : "html" as const;

    // status
    const rawStatus = (fields["status"] ?? "active").toLowerCase();
    const status = VALID_STATUS.includes(rawStatus as never)
      ? (rawStatus as typeof VALID_STATUS[number])
      : "active" as const;

    // allowlist
    const allowlisted = ["true", "yes", "1"].includes((fields["allowlist"] ?? "false").toLowerCase());

    // Build enriched notes (store authority + topics back in notes so round-trip is lossless)
    const authorityLine = fields["authority"] ? `Authority: ${fields["authority"]}` : null;
    const topicsLine    = fields["topics"]    ? `Topics: ${fields["topics"]}`       : null;
    const userNotes     = fields["notes"] ?? "";
    const combinedNotes = [authorityLine, topicsLine, userNotes].filter(Boolean).join("\n");

    const source: UpsertSourceRequest = {
      name: fields["name"],
      url: fields["url"],
      sourceType: "web",
      parserType,
      refreshFrequency,
      priority,
      allowlisted,
      digestEnabled: true,
      status,
      approvalStatus: "approved",
      notes: combinedNotes,
    };

    blocks.push({ source, warnings, raw });
  });

  return { blocks, errors };
}
