"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/client/api";
import type { DocumentChunkRecord, DocumentIngestionResult, DocumentRecord, DocumentVersionRecord } from "@/lib/domain/models/document";
import { formatDate } from "@/lib/utils";

interface DocumentDetailResponse {
  document: DocumentRecord;
  versions: DocumentVersionRecord[];
  chunks: DocumentChunkRecord[];
}

export function DocumentsManager() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();
  const [detail, setDetail] = useState<DocumentDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentRecord["category"]>("policy");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");

  async function loadDocuments() {
    setLoading(true);
    try {
      const data = await apiRequest<DocumentRecord[]>("/api/documents");
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadDocuments(); }, []);

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const data = await apiRequest<DocumentDetailResponse>(`/api/documents/${id}`);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load document details.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!uploadFile) { setError("Select a PDF or image before uploading."); return; }

    setUploading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const form = new FormData();
      form.append("file", uploadFile);
      form.append("category", category);
      if (title.trim()) form.append("title", title.trim());
      if (tags.trim()) form.append("tags", tags.trim());

      const result = await apiRequest<DocumentIngestionResult>("/api/documents/upload", {
        method: "POST",
        body: form,
      });

      setSuccess(`Uploaded ${result.document.title}. ${result.extractionNotice ?? "Extraction finished."} Approve it before retrieval uses it.`);
      setUploadFile(null);
      setTitle("");
      setTags("");
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleApprove(id: string) {
    setError(undefined);
    await apiRequest(`/api/documents/${id}/approve`, { method: "POST" });
    await loadDocuments();
    if (selectedId === id) await openDetail(id);
  }

  async function handleReprocess(id: string) {
    setError(undefined);
    await apiRequest(`/api/documents/${id}/reprocess`, { method: "POST" });
    await loadDocuments();
    if (selectedId === id) await openDetail(id);
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    setDeletingId(id);
    setConfirmDeleteId(undefined);
    setError(undefined);
    try {
      await apiRequest(`/api/documents/${id}`, { method: "DELETE" });
      if (selectedId === id) { setSelectedId(undefined); setDetail(null); }
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete document.");
    } finally {
      setDeletingId(undefined);
    }
  }

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <SectionCard title="Upload or scan" description="PDFs keep text extraction. Images run through local OCR before review.">
          <form className="space-y-4" onSubmit={handleUpload}>
            <Field label="File" hint="PDF, PNG, JPG, or WebP. Images are OCR'd into the governed pipeline.">
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--background)] px-6 py-8 text-center transition hover:bg-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
                  <AppIcon name="upload" className="h-5 w-5" />
                </div>
                <span className="mt-3 text-sm font-medium text-[color:var(--foreground)]">
                  {uploadFile ? uploadFile.name : "Drop a PDF or image here"}
                </span>
                <span className="mt-1 text-xs text-[color:var(--muted)]">Images are OCR'd. Approval required before retrieval.</span>
                <input
                  className="sr-only"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional display title" />
              </Field>
              <Field label="Category">
                <Select value={category} onChange={(e) => setCategory(e.target.value as DocumentRecord["category"])}>
                  <option value="policy">Policy</option>
                  <option value="employment-code">Employment code</option>
                  <option value="contract-template">Contract template</option>
                  <option value="case-note">Case note</option>
                </Select>
              </Field>
            </div>

            <Field label="Tags" hint="Short retrieval labels, comma separated.">
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="probation, leave, evidence" />
            </Field>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}
            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
            ) : null}

            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Document queue" description="Open a card to inspect versions, OCR output, and chunks.">
          {loading ? (
            <LoadingState label="Loading documents" />
          ) : !documents.length ? (
            <EmptyState title="No documents yet" description="Upload a PDF or image to start the local ingestion flow." />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {documents.map((doc) => (
                <article
                  key={doc.id}
                  className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4 transition hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[color:var(--foreground)] truncate">{doc.title}</p>
                      <p className="mt-0.5 text-[11px] text-[color:var(--muted)] truncate">{doc.fileName}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => void openDetail(doc.id)}>
                      Open
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <StatusBadge value={doc.processingStatus} />
                    <StatusBadge value={doc.approvalStatus} />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Chunks", value: doc.chunkCount },
                      { label: "Versions", value: doc.versionCount },
                      { label: "Type", value: doc.mimeType.startsWith("image/") ? "OCR" : "PDF" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-white border border-[color:var(--line)] px-3 py-2.5">
                        <p className="text-[10px] text-[color:var(--muted)]">{stat.label}</p>
                        <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-[color:var(--muted)]">Updated {formatDate(doc.updatedAt)}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => void handleReprocess(doc.id)}>
                      Reprocess
                    </Button>
                    <Button size="sm" onClick={() => void handleApprove(doc.id)} disabled={doc.approvalStatus === "approved"}>
                      Approve
                    </Button>
                    {confirmDeleteId === doc.id ? (
                      <>
                        <Button size="sm" variant="danger" onClick={() => void handleDelete(doc.id)} disabled={deletingId === doc.id}>
                          {deletingId === doc.id ? "Deleting…" : "Confirm delete"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(undefined)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => void handleDelete(doc.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <Drawer
        open={Boolean(selectedId)}
        title={detail?.document.title ?? "Document details"}
        description="Version history and chunk output."
        onClose={() => { setSelectedId(undefined); setDetail(null); }}
      >
        {detailLoading || !detail ? (
          <LoadingState label="Loading document details" />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Processing", content: <StatusBadge value={detail.document.processingStatus} /> },
                { label: "Approval", content: <StatusBadge value={detail.document.approvalStatus} /> },
                { label: "Type", content: <p className="text-sm font-medium text-[color:var(--foreground)]">{detail.document.mimeType.startsWith("image/") ? "OCR image" : "PDF"}</p> },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-[color:var(--background)] border border-[color:var(--line)] px-4 py-3">
                  <p className="text-[10px] text-[color:var(--muted)] uppercase tracking-widest">{item.label}</p>
                  <div className="mt-2">{item.content}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-[color:var(--foreground)]">Versions</h3>
              <div className="space-y-2">
                {detail.versions.map((v) => (
                  <div key={v.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-[color:var(--foreground)]">Version {v.versionNumber}</p>
                      <StatusBadge value={v.status} />
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      {v.pageCount} pages · {v.textLength} chars · {v.extractionMethod}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-[color:var(--foreground)]">Chunk output</h3>
              <div className="space-y-2">
                {detail.chunks.map((chunk) => (
                  <div key={chunk.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[color:var(--foreground)]">{chunk.sectionTitle ?? "General section"}</p>
                        <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                          {chunk.pageStart && chunk.pageEnd ? `pp. ${chunk.pageStart}–${chunk.pageEnd}` : "page n/a"}
                        </p>
                      </div>
                      <StatusBadge value={chunk.approvalStatus} />
                    </div>
                    <p className="mt-2 line-clamp-4 leading-6 text-[color:var(--muted)]">{chunk.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
