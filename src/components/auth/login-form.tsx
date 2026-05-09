"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("密码不正确。");
        return;
      }
      router.replace(nextPath.startsWith("/") ? nextPath : "/");
    });
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
            <LockKeyhole size={18} />
          </span>
          <div>
            <h1 className="text-xl font-bold">Enter access password</h1>
            <p className="text-sm text-slate-500">This BanDesk instance is private.</p>
          </div>
        </div>
        <div className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            placeholder="Password"
            autoFocus
          />
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <Button className="w-full" disabled={isPending} onClick={submit}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
