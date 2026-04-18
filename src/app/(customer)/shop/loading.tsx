import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <div className="max-w-xl space-y-3">
        <Skeleton className="h-9 w-2/3 bg-muted" />
        <Skeleton className="h-5 w-full bg-muted" />
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
