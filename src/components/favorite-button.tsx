import { toggleFavorite } from "@/app/favorites/actions";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M12 20.5l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5.42 3.64 3.8 5.75 3.8c1.2 0 2.35.56 3.1 1.45L12 8.6l3.15-3.35c.75-.89 1.9-1.45 3.1-1.45C20.36 3.8 22 5.42 22 7.5c0 3.78-3.4 6.86-8.55 11.68L12 20.5z" />
    </svg>
  );
}

/**
 * Wishlist toggle. `variant="icon"` is a round overlay heart for cards;
 * `variant="full"` is a labelled button for the product page.
 */
export function FavoriteButton({
  productId,
  favorited,
  redirectTo,
  variant = "icon",
}: {
  productId: string;
  favorited: boolean;
  redirectTo: string;
  variant?: "icon" | "full";
}) {
  return (
    <form action={toggleFavorite}>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      {variant === "icon" ? (
        <button
          type="submit"
          aria-label={favorited ? "Remove from wishlist" : "Save to wishlist"}
          className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition ${
            favorited
              ? "bg-accent text-accent-foreground"
              : "bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Heart filled={favorited} />
        </button>
      ) : (
        <button
          type="submit"
          className={`inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] transition ${
            favorited
              ? "border-accent bg-accent/10 text-accent-strong"
              : "border-border text-foreground hover:border-accent"
          }`}
        >
          <Heart filled={favorited} />
          {favorited ? "Saved" : "Save to wishlist"}
        </button>
      )}
    </form>
  );
}
