/**
 * Shown when Supabase isn't connected yet, so the catalog explains what to do
 * instead of rendering an empty page.
 */
export function SetupNotice() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
      <h2 className="font-serif text-2xl text-foreground">
        Connect Supabase to see the catalog
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        No products are loading because Supabase isn&apos;t configured yet.
        Create a project, run the migrations in{" "}
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">
          supabase/
        </code>
        , then add your keys to{" "}
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">
          .env.local
        </code>{" "}
        (see <code className="text-xs">.env.local.example</code>).
      </p>
    </div>
  );
}
