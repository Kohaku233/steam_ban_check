"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { BatchLookupRow, SteamLookupResult } from "@/lib/steam/types";
import { StatusPill } from "@/components/ui/status-pill";
import { lookupAccount } from "@/lib/steam/client";
import { AccountDetail } from "./account-detail";
import { hasAnyBan } from "./ban-helpers";

export function BatchResultsTable({ rows }: { rows: BatchLookupRow[] }) {
  const [selected, setSelected] = useState<SteamLookupResult | null>(null);
  const [detailMessage, setDetailMessage] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 100;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = useMemo(
    () => rows.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize),
    [rows, safePageIndex],
  );
  const rangeStart = rows.length ? safePageIndex * pageSize + 1 : 0;
  const rangeEnd = Math.min(rows.length, (safePageIndex + 1) * pageSize);
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
  const table = useReactTable({ data: pageRows, columns, getCoreRowModel: getCoreRowModel() });

  const selectRow = async (row: BatchLookupRow) => {
    if (row.status === "failed") {
      setSelected(null);
      setDetailMessage(row.error);
      return;
    }

    setSelected(row.result);
    if (row.result.timeline) {
      setDetailMessage("");
      return;
    }

    setDetailMessage("Loading full profile details...");
    try {
      const fullResult = await lookupAccount(row.result.steamId);
      setSelected(fullResult);
      setDetailMessage("");
    } catch (error) {
      setDetailMessage(error instanceof Error ? error.message : "Unable to load full profile details");
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {rangeStart}-{rangeEnd} / {rows.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePageIndex === 0}
              onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-16 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              {safePageIndex + 1} / {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={safePageIndex >= pageCount - 1}
              onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
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
                onClick={() => {
                  void selectRow(row.original);
                }}
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
      {detailMessage ? <p className="text-sm text-slate-500">{detailMessage}</p> : null}
      {selected ? <AccountDetail result={selected} /> : null}
    </div>
  );
}
