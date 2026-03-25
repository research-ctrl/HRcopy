import type { ChatThread, FeedbackRecord } from "@/lib/domain/models/chat";
import type { DashboardSnapshot } from "@/lib/domain/models/dashboard";
import type { DocumentChunkRecord, DocumentRecord, DocumentVersionRecord } from "@/lib/domain/models/document";
import type { MonitoringDigest, MonitoringRun, SourceChangeEvent } from "@/lib/domain/models/monitoring";
import type { ReviewQueueItem } from "@/lib/domain/models/review";
import type { AppSettings } from "@/lib/domain/models/settings";
import type { SourceRecord } from "@/lib/domain/models/source";
import type { ActorRef } from "@/lib/domain/types/common";

const legalOwner: ActorRef = {
  id: "actor-legal-01",
  name: "Ines Rocha",
  role: "legal-reviewer",
};

const opsOwner: ActorRef = {
  id: "actor-ops-01",
  name: "Miguel Costa",
  role: "ops-owner",
};

export const seedDocuments: DocumentRecord[] = [
  {
    id: "doc-001",
    title: "Codigo do Trabalho 2025 Extract",
    fileName: "codigo-trabalho-2025.pdf",
    mimeType: "application/pdf",
    language: "pt-PT",
    jurisdiction: "PT",
    category: "employment-code",
    sourceType: "document",
    tags: ["labour-law", "termination", "working-time"],
    uploadState: "stored",
    processingStatus: "approved",
    approvalStatus: "approved",
    currentVersionId: "ver-001",
    storagePath: "seed/codigo-trabalho-2025.pdf",
    chunkCount: 2,
    versionCount: 1,
    approvedBy: legalOwner,
    approvedAt: "2026-03-24T09:15:00.000Z",
    lastProcessedAt: "2026-03-24T08:40:00.000Z",
    effectiveDate: "2025-01-01T00:00:00.000Z",
    summary: "Primary labour-law reference currently approved for assistant answers.",
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-24T09:15:00.000Z",
  },
  {
    id: "doc-002",
    title: "Internal Leave Policy v3",
    fileName: "leave-policy-v3.pdf",
    mimeType: "application/pdf",
    language: "pt-PT",
    jurisdiction: "PT",
    category: "policy",
    sourceType: "document",
    tags: ["leave", "benefits", "internal-policy"],
    uploadState: "stored",
    processingStatus: "ready",
    approvalStatus: "pending",
    currentVersionId: "ver-002",
    storagePath: "seed/leave-policy-v3.pdf",
    chunkCount: 1,
    versionCount: 1,
    lastProcessedAt: "2026-03-23T14:25:00.000Z",
    summary: "Company leave entitlements, escalation points, and approval flow.",
    createdAt: "2026-03-21T11:30:00.000Z",
    updatedAt: "2026-03-23T14:25:00.000Z",
  },
];

export const seedVersions: DocumentVersionRecord[] = [
  {
    id: "ver-001",
    documentId: "doc-001",
    versionNumber: 1,
    storagePath: "seed/codigo-trabalho-2025.pdf",
    extractedTextPath: "seed/codigo-trabalho-2025.txt",
    fileHash: "seedhash-doc-001",
    textLength: 864,
    pageCount: 3,
    extractionMethod: "seed",
    status: "indexed",
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-24T08:40:00.000Z",
  },
  {
    id: "ver-002",
    documentId: "doc-002",
    versionNumber: 1,
    storagePath: "seed/leave-policy-v3.pdf",
    extractedTextPath: "seed/leave-policy-v3.txt",
    fileHash: "seedhash-doc-002",
    textLength: 392,
    pageCount: 2,
    extractionMethod: "seed",
    status: "indexed",
    createdAt: "2026-03-21T11:30:00.000Z",
    updatedAt: "2026-03-23T14:25:00.000Z",
  },
];

export const seedChunks: DocumentChunkRecord[] = [
  {
    id: "chunk-001",
    documentId: "doc-001",
    versionId: "ver-001",
    pageStart: 1,
    pageEnd: 2,
    sectionTitle: "Termination During Probation",
    sourceType: "document",
    approvalStatus: "approved",
    effectiveDate: "2025-01-01T00:00:00.000Z",
    text: "Termination during probation in Portugal depends on the probation period, contract type, and whether the worker belongs to a protected category. HR should verify notice timing and keep a documented evidence trail.",
    normalizedText:
      "termination during probation in portugal depends on the probation period contract type and whether the worker belongs to a protected category hr should verify notice timing and keep a documented evidence trail",
    embedding: [0.12, 0.42, 0.22],
    tokenCount: 31,
    hash: "seedchunk-001",
    createdAt: "2026-03-24T08:40:00.000Z",
    updatedAt: "2026-03-24T08:40:00.000Z",
  },
  {
    id: "chunk-002",
    documentId: "doc-001",
    versionId: "ver-001",
    pageStart: 2,
    pageEnd: 3,
    sectionTitle: "Renewal Limits",
    sourceType: "document",
    approvalStatus: "approved",
    effectiveDate: "2025-01-01T00:00:00.000Z",
    text: "Fixed-term contracts have statutory renewal limits and exceptions. HR should check the contract clause, cumulative duration, and any collective agreement before relying on a renewal assumption.",
    normalizedText:
      "fixed term contracts have statutory renewal limits and exceptions hr should check the contract clause cumulative duration and any collective agreement before relying on a renewal assumption",
    embedding: [0.22, 0.18, 0.51],
    tokenCount: 27,
    hash: "seedchunk-002",
    createdAt: "2026-03-24T08:40:00.000Z",
    updatedAt: "2026-03-24T08:40:00.000Z",
  },
  {
    id: "chunk-003",
    documentId: "doc-002",
    versionId: "ver-002",
    pageStart: 1,
    pageEnd: 1,
    sectionTitle: "Leave Escalation",
    sourceType: "document",
    approvalStatus: "pending",
    text: "Employees requesting exceptional leave must provide evidence and route the request to HR operations and the line manager for review.",
    normalizedText:
      "employees requesting exceptional leave must provide evidence and route the request to hr operations and the line manager for review",
    embedding: [0.33, 0.08, 0.2],
    tokenCount: 19,
    hash: "seedchunk-003",
    createdAt: "2026-03-23T14:25:00.000Z",
    updatedAt: "2026-03-23T14:25:00.000Z",
  },
];

export const seedSources: SourceRecord[] = [
  {
    id: "src-001",
    name: "Diario da Republica",
    url: "https://dre.pt",
    sourceType: "web",
    parserType: "html",
    refreshFrequency: "daily",
    priority: 5,
    owner: legalOwner,
    jurisdiction: "PT",
    status: "active",
    approvalStatus: "approved",
    allowlisted: true,
    digestEnabled: true,
    changeSeverity: "minor",
    lastContentHash: "seed-dre-hash",
    lastCheckedAt: "2026-03-25T04:00:00.000Z",
    nextCheckAt: "2026-03-26T04:00:00.000Z",
    notes: "Primary allowlisted legal publication source.",
    createdAt: "2026-03-20T08:00:00.000Z",
    updatedAt: "2026-03-25T04:00:00.000Z",
  },
  {
    id: "src-002",
    name: "ACT Guidance Portal",
    url: "https://portal.act.gov.pt",
    sourceType: "web",
    parserType: "html",
    refreshFrequency: "daily",
    priority: 4,
    owner: opsOwner,
    jurisdiction: "PT",
    status: "active",
    approvalStatus: "approved",
    allowlisted: true,
    digestEnabled: true,
    changeSeverity: "major",
    lastContentHash: "seed-act-hash",
    lastCheckedAt: "2026-03-25T04:05:00.000Z",
    nextCheckAt: "2026-03-26T04:05:00.000Z",
    notes: "Monitor for guidance updates affecting payroll and dismissal processes.",
    createdAt: "2026-03-20T08:05:00.000Z",
    updatedAt: "2026-03-25T04:05:00.000Z",
  },
  {
    id: "src-003",
    name: "Internal Handbook Mirror",
    url: "https://intranet.example.local/hr/handbook",
    sourceType: "web",
    parserType: "manual",
    refreshFrequency: "manual",
    priority: 2,
    owner: opsOwner,
    jurisdiction: "PT",
    status: "inactive",
    approvalStatus: "pending",
    allowlisted: false,
    digestEnabled: false,
    changeSeverity: "none",
    notes: "Pending governance review before allowlisting.",
    createdAt: "2026-03-24T13:00:00.000Z",
    updatedAt: "2026-03-24T13:00:00.000Z",
  },
];

export const seedRuns: MonitoringRun[] = [
  {
    id: "run-001",
    mode: "scheduled",
    status: "completed",
    startedAt: "2026-03-25T04:00:00.000Z",
    endedAt: "2026-03-25T04:03:00.000Z",
    sourcesChecked: 2,
    changesDetected: 1,
    changeEventIds: ["evt-001"],
    notes: "Detected update on ACT portal.",
    createdAt: "2026-03-25T04:00:00.000Z",
    updatedAt: "2026-03-25T04:03:00.000Z",
  },
];

export const seedEvents: SourceChangeEvent[] = [
  {
    id: "evt-001",
    runId: "run-001",
    sourceId: "src-002",
    severity: "major",
    fingerprint: "event-hash-001",
    summary: "ACT portal updated probation termination guidance wording.",
    detectedAt: "2026-03-25T04:02:00.000Z",
    createdAt: "2026-03-25T04:02:00.000Z",
    updatedAt: "2026-03-25T04:02:00.000Z",
  },
];

export const seedDigest: MonitoringDigest = {
  runId: "run-001",
  generatedAt: "2026-03-25T04:05:00.000Z",
  highlights: [
    "ACT portal updated wording around probation termination guidance.",
    "No changes detected on Diario da Republica labour-law index pages.",
  ],
  totalChanges: 1,
  escalatedSources: ["ACT Guidance Portal"],
};

export const seedReviews: ReviewQueueItem[] = [
  {
    id: "review-001",
    question: "Can a fixed-term contract be renewed more than three times?",
    answerPreview: "Answer references labour code article limits and flags exceptions requiring legal review.",
    verdict: "needs-edits",
    reviewer: "Ines Rocha",
    priority: "high",
    issueTags: ["citation-gap", "needs-clarification"],
    createdAt: "2026-03-25T07:00:00.000Z",
    updatedAt: "2026-03-25T07:20:00.000Z",
  },
];

export const seedThreads: ChatThread[] = [
  {
    id: "thread-001",
    title: "Termination during probation",
    provider: "local",
    citations: [
      {
        id: "chunk-001",
        title: "Codigo do Trabalho 2025 Extract",
        kind: "document",
        excerpt: "Termination during probation in Portugal depends on the probation period...",
        confidence: 0.93,
        formatted: "Codigo do Trabalho 2025 Extract, Termination During Probation, pp. 1-2",
        sectionTitle: "Termination During Probation",
        pageLabel: "pp. 1-2",
      },
    ],
    messages: [
      {
        id: "msg-001",
        role: "user",
        content: "What should HR verify before ending a probationary contract in Portugal?",
        createdAt: "2026-03-25T08:00:00.000Z",
        updatedAt: "2026-03-25T08:00:00.000Z",
      },
      {
        id: "msg-002",
        role: "assistant",
        content:
          "HR should verify the probation period, contract type, any protected status, and whether notice timing and evidence trail requirements have been met.",
        citations: [
          {
            id: "chunk-001",
            title: "Codigo do Trabalho 2025 Extract",
            kind: "document",
            excerpt: "Termination during probation in Portugal depends on the probation period...",
            confidence: 0.93,
            formatted: "Codigo do Trabalho 2025 Extract, Termination During Probation, pp. 1-2",
            sectionTitle: "Termination During Probation",
            pageLabel: "pp. 1-2",
          },
        ],
        confidence: 0.91,
        notice: "Development fallback answer.",
        qc: {
          status: "pass",
          groundedClaims: 1,
          totalClaims: 1,
          score: 0.91,
          notes: ["Seeded answer is grounded in approved document content."],
          claims: [
            {
              claim:
                "HR should verify the probation period, contract type, any protected status, and whether notice timing and evidence trail requirements have been met.",
              supported: true,
              supportingChunkIds: ["chunk-001"],
              score: 0.91,
            },
          ],
        },
        createdAt: "2026-03-25T08:00:30.000Z",
        updatedAt: "2026-03-25T08:00:30.000Z",
      },
    ],
    createdAt: "2026-03-25T08:00:00.000Z",
    updatedAt: "2026-03-25T08:00:30.000Z",
  },
];

export const seedFeedback: FeedbackRecord[] = [
  {
    id: "fb-001",
    threadId: "thread-001",
    messageId: "msg-002",
    signal: "helpful",
    comment: "Useful summary but still needs approval workflow reminder.",
    createdAt: "2026-03-25T08:05:00.000Z",
    updatedAt: "2026-03-25T08:05:00.000Z",
  },
];

export const seedSettings: AppSettings = {
  defaultJurisdiction: "PT",
  defaultLanguage: "pt-PT",
  mockMode: true,
  providerRouting: [
    {
      purpose: "chat",
      primary: "mistral",
      fallback: "compatible",
    },
    {
      purpose: "embeddings",
      primary: "nvidia",
      fallback: "compatible",
    },
    {
      purpose: "ocr",
      primary: "compatible",
      fallback: "local",
    },
  ],
  reviewThreshold: 0.78,
  createdAt: "2026-03-20T08:00:00.000Z",
  updatedAt: "2026-03-25T06:30:00.000Z",
};

export const seedDashboard: DashboardSnapshot = {
  metrics: [
    { label: "Approved documents", value: "1", delta: "1 ready for review" },
    { label: "Allowlisted sources", value: "2", delta: "1 pending review" },
    { label: "Monitoring coverage", value: "100%", delta: "daily digest active" },
    { label: "Answer review queue", value: "1", delta: "1 high priority" },
  ],
  alerts: [
    "One allowlisted source reported major content drift in the last run.",
    "One document remains pending approval and is excluded from retrieval.",
    "External model providers are optional in local mode and may fall back safely.",
  ],
};
