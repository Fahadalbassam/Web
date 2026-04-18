import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-48 bg-muted" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] rounded-2xl bg-muted" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 bg-muted" />
          <Skeleton className="h-10 w-full bg-muted" />
          <Skeleton className="h-4 w-2/3 bg-muted" />
          <Skeleton className="h-12 w-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
