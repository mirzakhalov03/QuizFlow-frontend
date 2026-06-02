export function ByokSkeleton() {
  return (
    <div className="border-border flex animate-pulse flex-col justify-between rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-10 w-10 shrink-0 rounded-full" />
          <div className="space-y-2">
            <div className="bg-muted h-4 w-24 rounded" />
            <div className="bg-muted h-3 w-16 rounded" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="bg-muted h-8 w-8 rounded" />
          <div className="bg-muted h-8 w-8 rounded" />
        </div>
      </div>
      <div className="mt-4">
        <div className="bg-muted h-8 w-full rounded-lg" />
      </div>
    </div>
  )
}
