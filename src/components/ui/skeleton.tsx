export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface-hover rounded-lg animate-pulse-skeleton ${className}`}
    />
  );
}

export function SnippetCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
