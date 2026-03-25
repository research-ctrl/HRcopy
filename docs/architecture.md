# Architecture

## Intent
This repository now implements the local runtime for HR legal assistance. The goal is accurate, traceable, file-backed operation before Supabase or live providers are required.

## Layers
1. `app/`
   - App Router pages and route handlers.
   - Reads from services only.
2. `components/`
   - Enterprise dashboard and chat shell components.
   - No infrastructure coupling.
3. `lib/domain/`
   - Core business types for documents, sources, chat, monitoring, reviews, and settings.
4. `lib/repositories/`
   - Persistence contracts and adapter implementations.
   - `local/` persists JSON-backed records under `data/db`.
   - `supabase/` is placeholder-only.
5. `lib/providers/`
   - Contracts for LLM, embeddings, storage, PDF extraction, and OCR.
   - Local providers implement storage, PDF parsing, deterministic embeddings, and development-safe answer fallback.
   - External adapters exist for NVIDIA-compatible, Mistral, and OpenAI-compatible APIs.
6. `lib/services/`
   - Business orchestration layer consumed by pages and APIs.
   - Includes document ingestion, retrieval, answer generation, QC, and monitoring.

## Runtime mode
- Current runtime is local and file-backed.
- Seed records are written into JSON files on first access so the UI remains populated.
- Uploaded files are stored under `data/uploads`.
- Route handlers return real local-mode results rather than static mock payloads.

## Request flow
1. `/api/documents/upload` stores a PDF locally and runs ingestion.
2. Ingestion extracts text, normalizes it, chunks by heading/length, embeds deterministically, and stores chunk metadata.
3. `/api/chat` retrieves approved chunks, routes generation through configured providers or local fallback, runs QC, stores the conversation, and returns citations plus confidence.
4. `/api/monitor/run` simulates a daily source run, stores change events, and updates the latest digest.

## Planned evolution
- Add Supabase repository implementations behind existing interfaces.
- Replace local storage provider with Supabase storage.
- Add ingestion workers and scheduled monitoring jobs.
- Introduce real provider routing for chat, embeddings, OCR, and summarization.
- Add approval workflows, audit trails, and authenticated user context.
