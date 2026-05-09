import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-700 focus:ring-4 focus:ring-sky-100",
        className,
      )}
      {...props}
    />
  );
}
