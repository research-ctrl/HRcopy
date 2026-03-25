import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[color:var(--background)]">
      <Sidebar />
      {/* main content — padding-bottom clears mobile tab bar */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 lg:py-8 lg:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
