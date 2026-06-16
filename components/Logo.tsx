import { APP_NAME } from "@/lib/config";

// Marca "Norte": aguja de brújula apuntando al norte.
// Mitad norte en color de acento, mitad sur atenuada.
function NorteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2.5 L14.6 12 L9.4 12 Z" fill="currentColor" />
      <path
        d="M12 21.5 L14.6 12 L9.4 12 Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
    </svg>
  );
}

export function Logo({
  size = "md",
}: {
  size?: "sm" | "md";
}) {
  const icon = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const text = size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="flex items-center gap-2.5 select-none">
      <NorteMark className={`${icon} text-accent`} />
      <span className={`${text} font-extrabold tracking-tight text-white`}>
        {APP_NAME}
      </span>
    </div>
  );
}