export function UsersTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-0 divide-y divide-gray-100 dark:divide-dark-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 flex-1 max-w-[200px] rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 flex-1 max-w-[240px] rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}
