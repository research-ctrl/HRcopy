# Codex Handoff

## What is implemented
- Next.js App Router app with Tailwind and TypeScript
- File-backed local repositories under `data/db`
- Local upload storage under `data/uploads`
- PDF ingestion, text normalization, heading-aware chunking, deterministic embeddings, and indexed retrieval
- Conversation/message persistence in local mode
- Citation formatting and QC grounding checks
- Daily monitoring run plus change-event persistence
- Provider routers and external adapter scaffolding for NVIDIA, Mistral, and OpenAI-compatible APIs
- Unit tests plus an integration test for upload -> approve -> ask

## Where to extend next
1. Add authentication and internal access control.
2. Implement Supabase repositories and storage provider.
3. Wire a real OCR engine.
4. Add live source fetching and web-content indexing.
5. Add background scheduling for monitor runs and ingestion jobs.
6. Add stronger review workflows and authenticated actor context.

## Assumptions in this scaffold
- Internal-only usage
- Portuguese labour-law focus
- Mock-first local development is the active requirement
- Live provider routing is a later phase

## Operational note
Current local adapters persist to JSON files and uploaded binaries. They are suitable for development and internal demos, but not for concurrent multi-user production use.
