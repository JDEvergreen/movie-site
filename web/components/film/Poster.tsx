import { posterUrl } from "@/lib/api";
import Image from "next/image";

// Poster as a design element (PLAN §10): fixed 2:3 ratio, graceful fallback.
export function Poster({
  path,
  title,
  rating,
}: {
  path?: string | null;
  title: string;
  rating?: number | null;
}) {
  const url = posterUrl(path);
  return (
    <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-card bg-cream-200 shadow-sm">
      {url ? (
        <Image
          src={url}
          alt={title}
          fill
          sizes="(max-width: 768px) 33vw, 160px"
          className="object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-2 text-center font-display text-sm text-ink-soft">
          {title}
        </div>
      )}
      {typeof rating === "number" && (
        <span className="absolute bottom-1 right-1 rounded bg-ink/80 px-1.5 py-0.5 text-xs font-medium text-cream-50">
          {(rating / 2).toFixed(1)}★
        </span>
      )}
    </div>
  );
}
