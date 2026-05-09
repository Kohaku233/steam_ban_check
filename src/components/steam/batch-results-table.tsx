"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { BatchLookupRow, SteamLookupResult } from "@/lib/steam/types";
import { StatusPill } from "@/components/ui/status-pill";
import { AccountDetail } from "./account-detail";
import { hasAnyBan } from "./ban-helpers";

export function BatchResultsTable({ rows }: { rows: BatchLookupRow[] }) {
  const [selected, setSelected] = useState<SteamLookupResult | null>(null);
  const columns = useMemo<ColumnDef<BatchLookupRow>[]>(
    () => [
      {
        header: "Account",
        cell: ({ row }) =>
          row.original.status === "success"
            ? row.original.result.profile?.personaName ?? row.original.result.steamId
            : row.original.input,
      },
      {
        header: "VAC",
        cell: ({ row }) =>
          row.original.status === "success" ? (
            <StatusPill tone={row.original.result.ban.vacBanned ? "danger" : "clean"}>
              {row.original.result.ban.vacBanned ? "Banned" : "Clean"}
            </StatusPill>
          ) : (
            <StatusPill tone="warning">Failed</StatusPill>
          ),
      },
      {
        header: "Game Ban",
        cell: ({ row }) => (row.original.status === "success" ? row.original.result.ban.numberOfGameBans : "-"),
      },
      {
        header: "Last Ban",
        cell: ({ row }) =>
          row.original.status === "success" && row.original.result.ban.daysSinceLastBan
            ? `${row.original.result.ban.daysSinceLastBan} days`
            : "-",
      },
      {
        header: "Status",
        cell: ({ row }) => {
          if (row.original.status === "failed") {
            return <span className="text-rose-700">{row.original.error}</span>;
          }
          return (
            <StatusPill tone={hasAnyBan(row.original.result.ban) ? "danger" : "clean"}>
              {hasAnyBan(row.original.result.ban) ? "Flagged" : "Clean"}
            </StatusPill>
          );
        },
      },
    ],
    [],
  );

  // TanStack Table intentionally returns function-rich table instances.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-semibold">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer transition hover:bg-slate-50"
                onClick={() => setSelected(row.original.status === "success" ? row.original.result : null)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected ? <AccountDetail result={selected} /> : null}
    </div>
  );
}
