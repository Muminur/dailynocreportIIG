/**
 * Loading Skeleton Component
 */

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      <div className="h-full w-full"></div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton className="h-12 w-full" />
      {[...Array(5)].map((_, i) => (
        <LoadingSkeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

