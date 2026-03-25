import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:px-8">
      <Sidebar />
      <div>{children}</div>
    </div>
  );
}
