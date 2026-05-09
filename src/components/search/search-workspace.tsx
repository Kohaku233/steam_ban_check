"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { FileUp, Search, RefreshCw } from "lucide-react";
import { parseAccountImport } from "@/lib/import/parse-import";
import { lookupAccount, lookupBatch, fetchHealth } from "@/lib/steam/client";
import type { BatchLookupRow, SteamLookupResult } from "@/lib/steam/types";
import { createCollection, saveQueryRun } from "@/lib/storage/repositories";
import { summarizeBatchRows } from "@/lib/storage/summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { AccountDetail } from "@/components/steam/account-detail";
import { BatchResultsTable } from "@/components/steam/batch-results-table";

export function SearchWorkspace() {
  const [input, setInput] = useState("");
  const [singleResult, setSingleResult] = useState<SteamLookupResult | null>(null);
  const [batchRows, setBatchRows] = useState<BatchLookupRow[]>([]);
  const [batchTitle, setBatchTitle] = useState("");
  const [message, setMessage] = useState("");
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHealth()
      .then((health) => setApiReady(health.steamApiKeyConfigured))
      .catch(() => setApiReady(false));
  }, []);

  const runSingleLookup = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setMessage("请输入 SteamID、Profile URL 或 Vanity URL。");
      return;
    }
    setMessage("");
    setBatchRows([]);
    startTransition(async () => {
      try {
        const result = await lookupAccount(trimmed);
        setSingleResult(result);
        await saveQueryRun({
          kind: "single",
          title: trimmed,
          inputs: [trimmed],
          rows: [{ input: trimmed, status: "success", result }],
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "查询失败。");
      }
    });
  };

  const onFileSelected = (file: File) => {
    startTransition(async () => {
      try {
        const content = await file.text();
        const parsed = parseAccountImport(content, file.name);
        const collection = await createCollection({
          name: parsed.name,
          sourceFileName: file.name,
          identifiers: parsed.identifiers,
        });
        setSingleResult(null);
        setBatchTitle(parsed.name);
        const rows = await lookupBatch(parsed.identifiers);
        setBatchRows(rows);
        await saveQueryRun({
          kind: "batch",
          title: parsed.name,
          collectionId: collection.id,
          inputs: parsed.identifiers,
          rows,
        });
        const rejected = parsed.rejectedRows.length ? `，跳过 ${parsed.rejectedRows.length} 行无效数据` : "";
        setMessage(`已保存集合 ${parsed.name}${rejected}。`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "导入失败。");
      }
    });
  };

  const summary = summarizeBatchRows(batchRows);

  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-3xl py-8 text-center">
        <div className="mb-5 inline-flex rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Local Steam Web API proxy
        </div>
        <h1 className="text-4xl font-bold tracking-normal text-slate-950">Steam Ban Checker</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          单查展示完整资料；导入 CSV/TXT 后保存为集合，下次可在 Collections 直接再次批量查询。
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") runSingleLookup();
            }}
            placeholder="SteamID64, profile URL, vanity URL"
            className="flex-1"
          />
          <Button onClick={runSingleLookup} disabled={isPending}>
            <Search size={16} /> 查询
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
            <FileUp size={16} /> 导入文件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFileSelected(file);
              event.currentTarget.value = "";
            }}
          />
        </div>
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          {apiReady === false ? (
            <StatusPill tone="warning">请在 .env.local 配置 STEAM_API_KEY</StatusPill>
          ) : apiReady === true ? (
            <StatusPill tone="clean">API key ready</StatusPill>
          ) : (
            <StatusPill>Checking local API</StatusPill>
          )}
          {isPending ? (
            <span className="inline-flex items-center gap-2 text-slate-500">
              <RefreshCw size={14} className="animate-spin" /> 查询中
            </span>
          ) : null}
        </div>
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      </section>

      {singleResult ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AccountDetail result={singleResult} />
        </motion.div>
      ) : null}

      {batchRows.length > 0 ? (
        <motion.section className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">当前批量查询：{batchTitle}</h2>
              <p className="text-sm text-slate-500">
                {summary.total} 个账号 · Clean {summary.clean} · Flagged {summary.banned} · Failed {summary.failed}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                const blob = new Blob([JSON.stringify(batchRows, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${batchTitle || "steam-ban-results"}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              导出结果
            </Button>
          </div>
          <BatchResultsTable rows={batchRows} />
        </motion.section>
      ) : null}
    </div>
  );
}
