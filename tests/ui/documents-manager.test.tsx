// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentsManager } from "@/components/admin/documents-manager";

const listResponse = [
  {
    id: "doc-1",
    title: "Leave Policy",
    fileName: "leave-policy.pdf",
    mimeType: "application/pdf",
    language: "pt-PT",
    jurisdiction: "PT",
    category: "policy",
    sourceType: "document",
    tags: [],
    uploadState: "stored",
    processingStatus: "ready",
    approvalStatus: "pending",
    chunkCount: 3,
    versionCount: 1,
    summary: "Policy summary",
    createdAt: "2026-03-25T08:00:00.000Z",
    updatedAt: "2026-03-25T08:00:00.000Z",
  },
];

describe("DocumentsManager", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";

        if (url === "/api/documents" && method === "GET") {
          return new Response(JSON.stringify(listResponse), { status: 200 });
        }

        if (url === "/api/documents/upload" && method === "POST") {
          return new Response(
            JSON.stringify({
              document: {
                ...listResponse[0],
                id: "doc-2",
                title: "Uploaded policy",
              },
              version: {
                id: "ver-2",
                documentId: "doc-2",
                versionNumber: 1,
                storagePath: "documents/doc-2/v1/uploaded.pdf",
                fileHash: "hash",
                textLength: 100,
                pageCount: 1,
                extractionMethod: "pdf-text",
                status: "indexed",
                createdAt: "2026-03-25T08:00:00.000Z",
                updatedAt: "2026-03-25T08:00:00.000Z",
              },
              chunksCreated: 2,
            }),
            { status: 201 },
          );
        }

        return new Response(JSON.stringify({}), { status: 200 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads a PDF and shows a success message", async () => {
    const user = userEvent.setup();
    render(<DocumentsManager />);

    expect(await screen.findByText("Leave Policy")).toBeInTheDocument();

    const file = new File(["pdf-data"], "uploaded.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText(/Drop a PDF or image here/i), file);
    await user.click(screen.getByRole("button", { name: /Upload/i }));

    expect(await screen.findByText(/Uploaded Uploaded policy/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/documents/upload",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
