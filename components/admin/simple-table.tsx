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
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              {columns.map((column) => (
                <th key={column.header} className="px-3 py-3 font-medium">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top last:border-b-0">
                {columns.map((column) => (
                  <td key={column.header} className="px-3 py-4 text-slate-700">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length ? (
        <div className="mt-4">
          <Badge tone="warning">No records</Badge>
        </div>
      ) : null}
    </SectionCard>
  );
}

