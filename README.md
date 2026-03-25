# HR Legal Assistant

Internal web app for an HR legal assistant focused on Portuguese workforce and legal guidance. The repository now includes a real local-mode backend with file-backed persistence, PDF ingestion, deterministic embeddings, retrieval, citations, QC, and monitoring, while still remaining runnable without Supabase or external provider credentials.

## Stack
- Next.js App Router
- TypeScript with strict typing
- Tailwind CSS
- File-backed local repositories plus provider routers

## What is included
- Polished responsive admin shell with enterprise-style chat and operations screens
- Chat experience with message history, citations, confidence, QC status, empty-state guidance, and approved-source notice
- Document operations with PDF upload, approval/reprocess actions, and metadata drill-down
- Source governance screen with parser, refresh, priority, approval, and allowlist controls
- Monitoring, reviews, dashboard, and settings screens backed by live local APIs
- Admin dashboard shell with left sidebar navigation
- Chat workspace backed by local retrieval, citations, and QC
- Typed domain models for documents, versions, chunks, sources, monitoring, chat, reviews, and settings
- File-backed local repositories under `data/db`
- Local upload storage under `data/uploads`
- Provider interfaces and routers for LLMs and embeddings
- Local deterministic embeddings and development LLM fallback
- Structured NVIDIA, Mistral, and OpenAI-compatible provider adapters
- Supabase placeholder adapters for later implementation
- Multipart PDF upload ingestion endpoint
- Unit and integration test coverage for local backend flows

## Repository structure
```text
app/                    App Router pages and API route handlers
components/             UI shell, admin tables, chat panels
lib/domain/             Strongly typed domain models and enums
lib/repositories/       Repository interfaces, local adapters, Supabase placeholders
lib/providers/          Provider interfaces and local stubs
lib/services/           Service interfaces, local implementations, wiring container
data/                   Local file-backed persistence and uploaded files
docs/                   Architecture, data model, ingestion, governance, migration docs
```

## Local setup
1. Copy `.env.example` to `.env.local`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).
5. Upload PDFs through `/api/documents/upload` using multipart form-data with:
   - `file`
   - `category`
   - optional `title`, `tags`, `effectiveDate`

## Validation
- Type check:
  ```bash
  npm run typecheck
  ```
- Test suite:
  ```bash
  npm test
  ```
- Production build:
  ```bash
  npm run build
  ```

## Architecture summary
- Pages and API handlers depend on services, not on raw mock data.
- Interactive client workspaces fetch from the app's API routes rather than hardcoded UI data.
- Services depend on repository and provider interfaces.
- Local adapters persist JSON records and uploaded files to disk so the app works without external infrastructure.
- Uploaded PDFs are stored locally, extracted, normalized, chunked by heading and length fallback, embedded deterministically, and indexed as retrievable chunks.
- Retrieval only returns approved chunks from approved documents and approved active allowlisted sources.
- Answers include citations, confidence, and a QC grounding result; low-grounding answers are pushed into the local review queue.
- Daily monitoring simulates runs over active allowlisted sources and records run plus change-event state.
- Supabase is intentionally not implemented yet; placeholder classes mark the future persistence seam.
- External provider routers are live structurally, but local fallback remains the default safe path when credentials are absent.

## Current gaps
- No Supabase integration yet
- No real authentication or RBAC
- OCR fallback is scaffolded but not wired to an OCR engine
- Web-source content fetching is simulated for monitoring; retrieval currently operates on locally indexed document chunks
- External LLM and embedding adapters require provider keys and were not exercised in local validation
- No background scheduler yet for automatic daily runs

## Docs
- [Architecture](./docs/architecture.md)
- [Data model](./docs/data-model.md)
- [Ingestion flow](./docs/ingestion-flow.md)
- [Source governance](./docs/source-governance.md)
- [Supabase migration plan](./docs/supabase-migration-plan.md)
- [Codex handoff](./docs/codex-handoff.md)
