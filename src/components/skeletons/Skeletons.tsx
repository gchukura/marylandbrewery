import { cn } from '@/lib/utils';

/** Grey placeholder blocks in the card shapes; pulse only when motion is allowed. */
function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-control bg-line/70 motion-safe:animate-pulse',
        className
      )}
    />
  );
}

/** Listing routes: breadcrumbs, h1, summary, filters, rows beside the map (City.html). */
export function ListingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading breweries"
      className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-14 pt-6 sm:px-6 sm:pt-7"
    >
      <div className="flex flex-col gap-3.5">
        <Bone className="h-3.5 w-48" />
        <Bone className="h-10 w-2/3 max-w-[520px] md:h-12" />
        <Bone className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-3">
        <Bone className="h-11 w-full" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }, (_, i) => (
            <Bone key={i} className="h-[38px] w-28 shrink-0 rounded-chip" />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-3.5">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="grid grid-cols-[112px_minmax(0,1fr)] gap-3.5 rounded-panel border border-line bg-white p-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-3.5"
            >
              <Bone className="aspect-[4/3]" />
              <div className="flex flex-col gap-2">
                <Bone className="h-6 w-3/5" />
                <Bone className="h-4 w-2/5" />
                <Bone className="hidden h-4 w-full sm:block" />
                <div className="mt-1 flex gap-2">
                  <Bone className="h-6 w-20 rounded-chip" />
                  <Bone className="h-6 w-24 rounded-chip" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Bone className="hidden h-[calc(100vh-48px)] max-h-[720px] min-w-0 flex-[1_1_420px] rounded-panel lg:block" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
