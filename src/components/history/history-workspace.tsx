"use client";

import { useEffect, useState } from "react";
import { listQueryRuns } from "@/lib/storage/repositories";
import type { QueryRun } from "@/lib/storage/types";
import { formatDateTime } from "@/lib/utils";
import { StatusPill } from "@/components/ui/status-pill";

export function HistoryWorkspace() {
  const [runs, setRuns] = useState<QueryRun[]>([]);

  useEffect(() => {
    listQueryRuns().then(setRuns);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="mt-2 text-slate-600">这里是查询日志。集合管理在 Collections，不在历史里混用。</p>
      </header>

      <div className="space-y-3">
        {runs.map((run) => (
          <article key={run.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold">{run.title}</h2>
                  <StatusPill>{run.kind}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDateTime(run.createdAt)} · {run.inputs.length} input(s)
                </p>
              </div>
              <div className="flex gap-2">
                <StatusPill tone="clean">Clean {run.summary.clean}</StatusPill>
                <StatusPill tone="danger">Flagged {run.summary.banned}</StatusPill>
                <StatusPill tone="warning">Failed {run.summary.failed}</StatusPill>
              </div>
            </div>
          </article>
        ))}
      </div>

      {runs.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          暂无查询历史。完成单查或批量查询后会出现在这里。
        </div>
      ) : null}
    </div>
  );
}
