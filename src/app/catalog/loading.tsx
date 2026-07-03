import { SiteHeader } from "@/components/site-header";

export default function CatalogLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
          <div className="mt-8 h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
                <div className="mt-4 h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-5 w-40 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
