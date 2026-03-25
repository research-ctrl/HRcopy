"use client";

import { useState } from "react";
import { DocumentsManager } from "@/components/admin/documents-manager";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "documents", label: "Documents" },
  { id: "reviews",   label: "Review queue" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function KnowledgeManager() {
  const [activeTab, setActiveTab] = useState<TabId>("documents");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[color:var(--line)] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-[color:var(--brand)] text-[color:var(--brand)]"
                : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "documents" && <DocumentsManager />}
      {activeTab === "reviews"   && <ReviewsManager />}
    </div>
  );
}
