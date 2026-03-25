import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render: (row: T) => React.ReactNode;
}

export function SimpleTable<T extends { id: string }>({
  title,
  description,
  rows,
  columns,
}: {
  title: string;
  description?: string;
  rows: T[];
  columns: TableColumn<T>[];
}) {
  return (
    <SectionCard title={title} description={description}>
      {!rows.length ? (
        <div className="py-2">
          <Badge tone="warning">No records</Badge>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[color:var(--line)]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--line)] bg-[color:var(--background)]">
                {columns.map((col) => (
                  <th key={col.header} className="px-4 py-2.5 text-xs font-semibold text-[color:var(--muted)]">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[color:var(--line)] align-top last:border-b-0 hover:bg-[color:var(--background)] transition-colors">
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3 text-[color:var(--foreground)]">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
