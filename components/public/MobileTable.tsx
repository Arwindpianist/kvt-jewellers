"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MobileTableRow {
  label: string;
  values: Record<string, string | number>;
}

interface MobileTableProps {
  title: string;
  headers: string[];
  rows: MobileTableRow[];
  className?: string;
}

export function MobileTable({ title, headers, rows, className }: MobileTableProps) {
  return (
    <>
      {/* Desktop: Regular Table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-brand-500 text-white">
              <th className="px-4 py-3 text-left text-sm font-semibold">{title}</th>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-right text-sm font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium">{row.label}</td>
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 text-sm text-right">
                    {row.values[header] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-3">
        {rows.map((row, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{row.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {headers.map((header) => (
                <div
                  key={header}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{header}</span>
                  <span className="text-sm font-semibold">
                    {row.values[header] || "-"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

