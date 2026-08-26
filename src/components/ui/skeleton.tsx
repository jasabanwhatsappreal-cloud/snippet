export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface-hover border-2 border-border animate-pulse-skeleton ${className}`}
    />
  );
}

export function SnippetCardSkeleton() {
  return (
    <div className="bg-surface border-2 border-border p-5 space-y-3 shadow-[4px_4px_0_#1a1a1a]">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
