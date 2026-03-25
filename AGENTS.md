# AGENTS.md

## Project
- Name: `hr-legal-assistant`
- Purpose: internal-only HR legal assistant for Portuguese workforce and employment-law guidance.
- Current phase: production-grade scaffold with mock/local adapters only. Supabase and live providers are deferred.

## Stack
- Next.js with App Router
- TypeScript in strict mode
- Tailwind CSS
- Mock-first local services and repository adapters

## Non-Negotiables
- Keep the app runnable locally without Supabase or external provider credentials.
- Preserve typed separation between domain models, repositories, services, and providers.
- Treat document approval and source allowlisting as first-class governance concepts.
- Do not bypass the abstraction layers by reading seed data or JSON files directly from pages or route handlers.
- Any future live integration must be added behind existing interfaces first.
- Local runtime data lives under `data/db` and `data/uploads`.

## Route Scope
- Pages:
  - `/`
  - `/chat`
  - `/admin`
  - `/admin/documents`
  - `/admin/sources`
  - `/admin/runs`
  - `/admin/reviews`
  - `/admin/settings`
- API placeholders:
  - `/api/health`
  - `/api/chat`
  - `/api/feedback`
  - `/api/documents/upload`
  - `/api/documents/[id]`
  - `/api/documents/[id]/approve`
  - `/api/documents/[id]/reprocess`
  - `/api/sources`
  - `/api/sources/[id]`
  - `/api/monitor/run`
  - `/api/monitor/digest`
  - `/api/dev/seed`

## Architecture Rules
- Domain types live under `lib/domain`.
- Repository interfaces live under `lib/repositories/interfaces`.
- Local adapters live under `lib/repositories/local`.
- Supabase placeholders live under `lib/repositories/supabase`.
- Provider interfaces live under `lib/providers/interfaces`.
- Local provider stubs live under `lib/providers/local`.
- Services compose repositories and providers; pages and route handlers consume services.
- Shared service wiring belongs in `lib/services/shared`.

## UI Rules
- Maintain a clean enterprise dashboard aesthetic.
- Admin routes use the sidebar shell.
- Use mock data to keep lists and metrics populated.
- Favor server components unless interactivity is actually needed.

## Future Integration Guidance
- Supabase should be introduced by implementing repository and storage/provider placeholders, not by rewriting route handlers.
- RAG, OCR, PDF extraction, monitoring, and provider routing should stay replaceable via interfaces.
- Any live answer generation must preserve citation, review, and governance metadata.
- Uploaded documents must remain traceable through document, version, and chunk records.

## Validation Expectations
- `npm install`
- `npm run typecheck`
- `npm run build`
- `npm run dev`
