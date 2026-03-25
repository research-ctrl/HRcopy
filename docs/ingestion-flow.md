# Ingestion Flow

## Current implementation
1. PDF upload hits `/api/documents/upload` as multipart form-data.
2. The file is stored locally under `data/uploads/documents/<document-id>/...`.
3. A document record is created with pending approval.
4. PDF text extraction runs through the local extractor.
5. Extracted text is normalized and split into heading-based sections, with length fallback.
6. Chunks are embedded using the deterministic local embedding provider unless an external embedding provider is configured.
7. Chunk metadata and the extracted text path are persisted in local JSON storage.
8. Approval is triggered through `/api/documents/[id]/approve`.

## Intended future flow
1. Upload file to storage.
2. Persist document metadata.
3. Run PDF extraction.
4. Run OCR if extraction confidence is low or scanned content is detected.
5. Chunk and embed the extracted text.
6. Mark the document as ready for review.
7. Approve the document before it becomes answer-eligible.

## Important constraints
- Unapproved documents should not participate in retrieval.
- Reprocessing should create traceable run metadata.
- Extraction and embedding failures should be visible in admin views.
- OCR fallback is intentionally scaffolded but not wired; extraction failures remain explicit.
