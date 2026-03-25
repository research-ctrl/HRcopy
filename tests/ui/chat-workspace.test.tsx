// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

const initialThreads = [
  {
    id: "thread-1",
    title: "Probation review",
    provider: "local",
    citations: [],
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "What should HR verify?",
        createdAt: "2026-03-25T08:00:00.000Z",
        updatedAt: "2026-03-25T08:00:00.000Z",
      },
    ],
    createdAt: "2026-03-25T08:00:00.000Z",
    updatedAt: "2026-03-25T08:00:00.000Z",
  },
];

const updatedThread = {
  ...initialThreads[0],
  messages: [
    ...initialThreads[0].messages,
    {
      id: "msg-2",
      role: "assistant",
      content: "Development fallback: approved evidence says HR should verify probation length.",
      confidence: 0.88,
      notice: "External providers were unavailable.",
      citations: [
        {
          id: "chunk-1",
          title: "Employment Code",
          kind: "document",
          excerpt: "HR should verify probation length.",
          confidence: 0.88,
          formatted: "Employment Code, Probation, p. 2",
        },
      ],
      qc: {
        status: "pass",
        groundedClaims: 1,
        totalClaims: 1,
        score: 0.88,
        notes: ["Claims are substantially grounded in retrieved approved chunks."],
        claims: [],
      },
      createdAt: "2026-03-25T08:01:00.000Z",
      updatedAt: "2026-03-25T08:01:00.000Z",
    },
  ],
  citations: [
    {
      id: "chunk-1",
      title: "Employment Code",
      kind: "document",
      excerpt: "HR should verify probation length.",
      confidence: 0.88,
      formatted: "Employment Code, Probation, p. 2",
    },
  ],
  updatedAt: "2026-03-25T08:01:00.000Z",
};

describe("ChatWorkspace", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";

        if (url === "/api/chat" && method === "GET") {
          return new Response(JSON.stringify(initialThreads), { status: 200 });
        }

        if (url === "/api/chat" && method === "POST") {
          return new Response(JSON.stringify({ threadId: "thread-1" }), { status: 200 });
        }

        if (url.includes("/api/chat?threadId=thread-1")) {
          return new Response(JSON.stringify(updatedThread), { status: 200 });
        }

        return new Response(JSON.stringify([]), { status: 200 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads threads, applies suggestion prompts, and renders the assistant answer after submit", async () => {
    const user = userEvent.setup();
    render(<ChatWorkspace />);

    expect((await screen.findAllByText("Probation review")).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /What should HR verify before ending a probationary contract/i }));
    const input = screen.getByLabelText("Ask a question");
    expect(input).toHaveValue("What should HR verify before ending a probationary contract in Portugal?");

    await user.click(screen.getByRole("button", { name: /Ask assistant/i }));

    expect(await screen.findByText(/Development fallback: approved evidence says HR should verify probation length/i)).toBeInTheDocument();
    expect(screen.getByText(/Employment Code, Probation, p. 2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Confidence 88%/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
