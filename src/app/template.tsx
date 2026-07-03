/**
 * Wraps every route. Because a template re-mounts on each navigation, the
 * `.page-enter` animation replays on every page change — a smooth site-wide
 * transition. (Respects prefers-reduced-motion via globals.css.)
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
