import { Rocket } from "lucide-react";
import { APP_NAME } from "@/lib/config";

export function Logo({
  size = "md",
}: {
  size?: "sm" | "md";
}) {
  const icon = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const text = size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Rocket className={`${icon} -rotate-45 text-accent`} strokeWidth={2.5} />
      <span className={`${text} font-extrabold tracking-tight text-white`}>
        {APP_NAME}
      </span>
    </div>
  );
}
