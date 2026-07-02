import { signOut } from "@/app/auth/actions";

/** Posts to the signOut server action. Works without client JS. */
export function SignOutButton({
  className = "text-sm text-muted-foreground transition hover:text-foreground",
  label = "Sign out",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <form action={signOut}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
