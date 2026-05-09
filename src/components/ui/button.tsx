import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-sky-700 text-white hover:bg-sky-800 focus-visible:outline-sky-700",
        variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-400",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-300",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600",
        className,
      )}
      {...props}
    />
  );
}
