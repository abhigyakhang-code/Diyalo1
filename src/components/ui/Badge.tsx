import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "purple";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ 
  children, 
  variant = "default", 
  size = "sm",
  className 
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    purple: "bg-purple-100 text-purple-800 border border-purple-200"
  };
  
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm"
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-semibold",
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
}
