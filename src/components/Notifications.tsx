import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../utils/cn";

export function Notifications() {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center gap-1 pt-3 px-4 pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          className={cn(
            "pointer-events-auto w-full max-w-lg rounded-xl px-5 py-3 shadow-lg text-sm font-semibold flex items-center gap-3 animate-[slideDown_0.3s_ease-out]",
            n.type === "success" && "bg-emerald-600 text-white",
            n.type === "warning" && "bg-amber-500 text-white",
            n.type === "info" && "bg-blue-600 text-white"
          )}
        >
          {n.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> :
           n.type === "warning" ? <AlertCircle className="h-5 w-5 shrink-0" /> :
           <Info className="h-5 w-5 shrink-0" />}
          <span className="flex-1">{n.message}</span>
          <button 
            onClick={() => removeNotification(n.id)} 
            className="shrink-0 hover:opacity-80 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
