# Data Model

## Core entities

### Documents
- Represent uploaded PDFs or internal legal materials.
- Key fields:
  - `processingStatus`
  - `approvalStatus`
  - `approvedBy`
  - `approvedAt`
  - `chunkCount`
  - `currentVersionId`
  - `summary`

### Document versions
- Track each stored file and extraction/indexing pass.
- Key fields:
  - `storagePath`
  - `extractedTextPath`
  - `fileHash`
  - `pageCount`
  - `extractionMethod`

### Document chunks
- Retrieval unit for RAG and citation generation.
- Key fields:
  - `documentId`
  - `versionId`
  - `pageStart` / `pageEnd`
  - `sectionTitle`
  - `sourceType`
  - `approvalStatus`
  - `effectiveDate`
  - `embedding`

### Sources
- Represent allowlisted web origins eligible for monitoring and future retrieval.
- Key fields:
  - `status`
  - `approvalStatus`
  - `allowlisted`
  - `digestEnabled`
  - `changeSeverity`
  - `lastCheckedAt`
  - `nextCheckAt`

### Chat threads
- Preserve messages, selected provider, and citations.
- Assistant messages also store confidence, citations, QC results, and development notices.

### Reviews
- Model quality-control work queued for legal or HR reviewers.
- Current scaffold tracks verdict, priority, and issue tags.

### Monitoring runs
- Track scheduled or manual source checks and digest output.
- Change events are stored separately and linked back to the run.

### Settings
- Hold runtime defaults, provider routing policy, and review threshold.

## Modeling principles
- All records are strongly typed.
- Audit timestamps exist on all major entities.
- Governance state is explicit rather than inferred.
- Future database tables should preserve these domain names where practical.
