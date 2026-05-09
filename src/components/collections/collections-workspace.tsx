"use client";

import { useEffect, useState, useTransition } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import type { AccountCollection } from "@/lib/storage/types";
import { deleteCollection, listCollections, renameCollection, saveQueryRun } from "@/lib/storage/repositories";
import { lookupBatch } from "@/lib/steam/client";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";

export function CollectionsWorkspace() {
  const [collections, setCollections] = useState<AccountCollection[]>([]);
  const [message, setMessage] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    listCollections().then(setCollections);
  };

  useEffect(refresh, []);

  const rerunCollection = (collection: AccountCollection) => {
    startTransition(async () => {
      try {
        const rows = await lookupBatch(collection.identifiers);
        await saveQueryRun({
          kind: "batch",
          title: collection.name,
          collectionId: collection.id,
          inputs: collection.identifiers,
          rows,
        });
        setMessage(`已重新查询 ${collection.name}。结果已写入 History。`);
        refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "集合查询失败。");
      }
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Collections</h1>
        <p className="mt-2 text-slate-600">导入过的名单会保存在这里。下次可直接重查，不需要再次选择文件。</p>
      </header>

      {message ? <p className="rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}

      <div className="space-y-3">
        {collections.map((collection) => (
          <article key={collection.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {renamingId === collection.id ? (
                    <input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      className="h-9 rounded-md border border-slate-300 px-2 text-sm font-semibold outline-none focus:border-sky-700"
                    />
                  ) : (
                    <h2 className="font-bold">{collection.name}</h2>
                  )}
                  <StatusPill>{collection.identifiers.length} accounts</StatusPill>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Source: {collection.sourceFileName} · Last queried: {formatDateTime(collection.lastQueriedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                {renamingId === collection.id ? (
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (draftName.trim()) {
                        await renameCollection(collection.id, draftName.trim());
                        setRenamingId(null);
                        refresh();
                      }
                    }}
                  >
                    保存
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRenamingId(collection.id);
                      setDraftName(collection.name);
                    }}
                  >
                    重命名
                  </Button>
                )}
                <Button variant="secondary" disabled={isPending} onClick={() => rerunCollection(collection)}>
                  <RefreshCw size={15} /> 重新查询
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await deleteCollection(collection.id);
                    refresh();
                  }}
                >
                  <Trash2 size={15} /> 删除
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {collections.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          还没有集合。回到 Search 导入 CSV/TXT 后会自动保存。
        </div>
      ) : null}
    </div>
  );
}
