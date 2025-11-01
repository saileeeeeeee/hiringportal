export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded-lg w-3/4"></div>
          <div className="h-3 bg-muted rounded-lg w-1/2"></div>
        </div>
        <div className="h-6 bg-muted rounded-full w-20"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 bg-muted rounded-lg"></div>
        ))}
      </div>
      <div className="h-2 bg-muted rounded-lg w-full"></div>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 bg-muted rounded-full w-16"></div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-2 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}
