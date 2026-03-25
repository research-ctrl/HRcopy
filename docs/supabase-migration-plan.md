# Supabase Migration Plan

## Goal
Swap the current local adapters for Supabase-backed persistence and storage without changing page or route-handler contracts.

## Sequence
1. Add Supabase client bootstrap and environment validation.
2. Implement repository classes under `lib/repositories/supabase`.
3. Implement storage provider for document binaries.
4. Introduce database tables for documents, sources, runs, reviews, feedback, and conversations.
5. Move seed data into SQL or seed scripts.
6. Replace local service container selection with environment-based adapter wiring.

## Guardrails
- Keep repository interfaces stable.
- Preserve all governance fields.
- Avoid leaking Supabase query shapes into pages or components.
- Migrate one domain boundary at a time.

## Likely first wins
- Documents and sources
- Monitoring runs and digests
- Feedback and review queue
- Chat transcripts after governance rules are stable

