-- ============================================================
-- HR Assistant — Supabase Schema
-- Run this in the Supabase SQL Editor (one paste, all at once)
-- ============================================================

-- Enable the pgvector extension for embeddings
create extension if not exists vector with schema extensions;

-- ── Documents ────────────────────────────────────────────────

create table if not exists documents (
  id           text primary key,
  title        text not null,
  file_name    text not null,
  mime_type    text not null default 'application/pdf',
  language     text not null default 'pt-PT',
  jurisdiction text not null default 'PT',
  category     text not null check (category in ('employment-code','policy','contract-template','case-note')),
  source_type  text not null default 'document' check (source_type in ('document','web')),
  tags         text[]  not null default '{}',
  upload_state text    not null default 'received' check (upload_state in ('received','stored')),
  processing_status text not null default 'pending',
  approval_status   text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  current_version_id text,
  storage_path       text,
  chunk_count        integer not null default 0,
  version_count      integer not null default 0,
  approved_by        text,
  approved_at        timestamptz,
  last_processed_at  timestamptz,
  effective_date     date,
  summary            text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── Document Versions ────────────────────────────────────────

create table if not exists document_versions (
  id                 text primary key,
  document_id        text not null references documents(id) on delete cascade,
  version_number     integer not null,
  storage_path       text not null,
  extracted_text_path text,
  file_hash          text not null,
  text_length        integer not null default 0,
  page_count         integer not null default 0,
  extraction_method  text not null default 'pdf-text' check (extraction_method in ('pdf-text','ocr-fallback','seed')),
  status             text not null default 'stored' check (status in ('stored','extracted','indexed','failed')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── Document Chunks (with embeddings) ────────────────────────

create table if not exists document_chunks (
  id              text primary key,
  document_id     text not null references documents(id) on delete cascade,
  version_id      text not null references document_versions(id) on delete cascade,
  source_id       text,
  page_start      integer,
  page_end        integer,
  section_title   text,
  source_type     text not null default 'document',
  approval_status text not null default 'pending',
  effective_date  date,
  text            text not null,
  normalized_text text not null default '',
  embedding       vector(1024),   -- 1024 dims for Mistral / change to 768 for other models
  token_count     integer not null default 0,
  hash            text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for fast similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ── Web Sources ──────────────────────────────────────────────

create table if not exists sources (
  id                text primary key,
  name              text not null,
  url               text not null,
  source_type       text not null default 'web',
  parser_type       text not null default 'html' check (parser_type in ('html','rss','sitemap','manual')),
  refresh_frequency text not null default 'weekly' check (refresh_frequency in ('daily','weekly','manual')),
  priority          integer not null default 3 check (priority between 1 and 5),
  owner             text,
  jurisdiction      text not null default 'PT',
  status            text not null default 'active',
  approval_status   text not null default 'pending',
  allowlisted       boolean not null default false,
  digest_enabled    boolean not null default false,
  change_severity   text not null default 'none' check (change_severity in ('none','minor','major')),
  last_content_hash text,
  last_checked_at   timestamptz,
  next_check_at     timestamptz,
  notes             text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Monitoring Runs ──────────────────────────────────────────

create table if not exists monitoring_runs (
  id                text primary key,
  mode              text not null default 'manual' check (mode in ('scheduled','manual')),
  status            text not null default 'pending',
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  sources_checked   integer not null default 0,
  changes_detected  integer not null default 0,
  change_event_ids  text[]  not null default '{}',
  notes             text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists source_change_events (
  id           text primary key,
  run_id       text not null references monitoring_runs(id) on delete cascade,
  source_id    text not null references sources(id) on delete cascade,
  severity     text not null default 'minor' check (severity in ('minor','major')),
  fingerprint  text not null,
  summary      text not null default '',
  detected_at  timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Chat Threads & Messages ──────────────────────────────────

create table if not exists chat_threads (
  id         text primary key,
  title      text not null default 'New conversation',
  provider   text not null default 'local',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id          text primary key,
  thread_id   text not null references chat_threads(id) on delete cascade,
  role        text not null check (role in ('user','assistant')),
  content     text not null,
  citations   jsonb not null default '[]',
  confidence  numeric,
  qc          jsonb,
  notice      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists chat_messages_thread_idx on chat_messages(thread_id, created_at);

-- ── Review Queue ─────────────────────────────────────────────

create table if not exists review_queue (
  id             text primary key,
  question       text not null,
  answer_preview text not null default '',
  verdict        text not null default 'pending',
  reviewer       text not null default '',
  priority       text not null default 'medium' check (priority in ('high','medium','low')),
  issue_tags     text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Feedback ─────────────────────────────────────────────────

create table if not exists feedback (
  id         text primary key,
  thread_id  text not null references chat_threads(id) on delete cascade,
  message_id text not null references chat_messages(id) on delete cascade,
  signal     text not null check (signal in ('up','down')),
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── App Settings ─────────────────────────────────────────────

create table if not exists app_settings (
  id                   integer primary key default 1 check (id = 1), -- singleton row
  default_jurisdiction text not null default 'PT',
  default_language     text not null default 'pt-PT',
  mock_mode            boolean not null default false,
  provider_routing     jsonb not null default '[]',
  review_threshold     numeric not null default 0.6,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Insert default settings row if not exists
insert into app_settings (id) values (1) on conflict do nothing;

-- ── Row-Level Security (basic — tighten per your auth setup) ─

alter table documents          enable row level security;
alter table document_versions  enable row level security;
alter table document_chunks    enable row level security;
alter table sources            enable row level security;
alter table monitoring_runs    enable row level security;
alter table source_change_events enable row level security;
alter table chat_threads       enable row level security;
alter table chat_messages      enable row level security;
alter table review_queue       enable row level security;
alter table feedback           enable row level security;
alter table app_settings       enable row level security;

-- Allow all access via the service role key (used by your Next.js backend)
-- If you add Supabase Auth later, replace these with per-user policies.

create policy "service role full access" on documents          for all using (true);
create policy "service role full access" on document_versions  for all using (true);
create policy "service role full access" on document_chunks    for all using (true);
create policy "service role full access" on sources            for all using (true);
create policy "service role full access" on monitoring_runs    for all using (true);
create policy "service role full access" on source_change_events for all using (true);
create policy "service role full access" on chat_threads       for all using (true);
create policy "service role full access" on chat_messages      for all using (true);
create policy "service role full access" on review_queue       for all using (true);
create policy "service role full access" on feedback           for all using (true);
create policy "service role full access" on app_settings       for all using (true);

-- ── Similarity Search Helper Function ───────────────────────
-- Call this from your app to do RAG retrieval:
--   select * from match_chunks('[0.1, 0.2, ...]', 0.3, 5);

create or replace function match_chunks(
  query_embedding vector(1024),
  similarity_threshold float default 0.3,
  match_count int default 5
)
returns table (
  id              text,
  document_id     text,
  text            text,
  section_title   text,
  page_start      integer,
  page_end        integer,
  approval_status text,
  similarity      float
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.text,
    dc.section_title,
    dc.page_start,
    dc.page_end,
    dc.approval_status,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where
    dc.approval_status = 'approved'
    and 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
