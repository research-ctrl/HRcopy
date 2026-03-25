"use client";

import { useEffect, useState } from "react";
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
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const data = await apiRequest<DocumentDetailResponse>(`/api/documents/${id}`);
      setDetail(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load document details.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!uploadFile) {
      setError("Select a PDF file before uploading.");
      return;
    }

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

      setSuccess(`Uploaded and processed ${result.document.title}.`);
      setUploadFile(null);
      setTitle("");
      setTags("");
      await loadDocuments();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleApprove(id: string) {
    setError(undefined);
    await apiRequest(`/api/documents/${id}/approve`, { method: "POST" });
    await loadDocuments();
    if (selectedId === id) {
      await openDetail(id);
    }
  }

  async function handleReprocess(id: string) {
    setError(undefined);
    await apiRequest(`/api/documents/${id}/reprocess`, { method: "POST" });
    await loadDocuments();
    if (selectedId === id) {
      await openDetail(id);
    }
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
        <SectionCard title="Upload PDF" description="Local-mode ingestion stores the PDF, extracts text, chunks it, embeds it, and indexes it for retrieval.">
          <form className="space-y-4" onSubmit={handleUpload}>
            <Field label="PDF file" hint="PDF only. Files are stored under data/uploads in local mode.">
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
                <span className="text-sm font-semibold text-slate-800">{uploadFile ? uploadFile.name : "Drop a PDF here or click to browse"}</span>
                <span className="mt-2 text-sm text-slate-500">Processed immediately through the local ingestion pipeline.</span>
                <input
                  className="sr-only"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional display title" />
              </Field>
              <Field label="Category">
                <Select value={category} onChange={(event) => setCategory(event.target.value as DocumentRecord["category"])}>
                  <option value="policy">Policy</option>
                  <option value="employment-code">Employment code</option>
                  <option value="contract-template">Contract template</option>
                  <option value="case-note">Case note</option>
                </Select>
              </Field>
            </div>

            <Field label="Tags" hint="Comma-separated labels for retrieval and filtering.">
              <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="dismissal, probation, evidence" />
            </Field>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload and process"}
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Document operations" description="Approve and reprocess uploaded documents. Click a row to inspect version and chunk metadata.">
          {loading ? (
            <LoadingState label="Loading documents" />
          ) : !documents.length ? (
            <EmptyState title="No documents yet" description="Upload a PDF to start the local ingestion and approval flow." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Document</th>
                    <th className="px-3 py-3 font-medium">Processing</th>
                    <th className="px-3 py-3 font-medium">Approval</th>
                    <th className="px-3 py-3 font-medium">Chunks</th>
                    <th className="px-3 py-3 font-medium">Versions</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr
                      key={document.id}
                      className="cursor-pointer border-b border-slate-100 align-top transition hover:bg-slate-50"
                      onClick={() => void openDetail(document.id)}
                    >
                      <td className="px-3 py-4">
                        <p className="font-medium text-slate-900">{document.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{document.fileName}</p>
                        <p className="mt-2 text-xs text-slate-500">{formatDate(document.updatedAt)}</p>
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge value={document.processingStatus} />
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge value={document.approvalStatus} />
                      </td>
                      <td className="px-3 py-4 text-slate-700">{document.chunkCount}</td>
                      <td className="px-3 py-4 text-slate-700">{document.versionCount}</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleReprocess(document.id);
                            }}
                          >
                            Reprocess
                          </Button>
                          <Button
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleApprove(document.id);
                            }}
                            disabled={document.approvalStatus === "approved"}
                          >
                            Approve
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      <Drawer
        open={Boolean(selectedId)}
        title={detail?.document.title ?? "Document details"}
        description="Version history, extracted chunk metadata, and approval posture."
        onClose={() => {
          setSelectedId(undefined);
          setDetail(null);
        }}
      >
        {detailLoading || !detail ? (
          <LoadingState label="Loading document details" />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Processing</p>
                <div className="mt-2">
                  <StatusBadge value={detail.document.processingStatus} />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Approval</p>
                <div className="mt-2">
                  <StatusBadge value={detail.document.approvalStatus} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">Versions</h3>
              <div className="mt-3 space-y-3">
                {detail.versions.map((version) => (
                  <div key={version.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">Version {version.versionNumber}</p>
                      <StatusBadge value={version.status} />
                    </div>
                    <p className="mt-2 text-slate-600">
                      {version.pageCount} pages • {version.textLength} chars • {version.extractionMethod}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">Chunk metadata</h3>
              <div className="mt-3 space-y-3">
                {detail.chunks.map((chunk) => (
                  <div key={chunk.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{chunk.sectionTitle ?? "General section"}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {chunk.pageStart && chunk.pageEnd ? `pp. ${chunk.pageStart}-${chunk.pageEnd}` : "page n/a"}
                        </p>
                      </div>
                      <StatusBadge value={chunk.approvalStatus} />
                    </div>
                    <p className="mt-3 line-clamp-4 leading-6 text-slate-600">{chunk.text}</p>
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
