import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { CustomerNav } from "./customer-nav";
import { Logo } from "./logo";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-paper">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="ResolveAI home">
            <Logo />
          </Link>
          {user?.role === "customer" && <CustomerNav />}
        </div>

        {user ? (
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-on-ink"
            >
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
            <div className="hidden min-w-0 text-sm sm:block">
              <p className="truncate font-medium text-ink">{user.name}</p>
              <p className="truncate text-mute">{user.email}</p>
            </div>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-control px-3 py-1.5 font-medium text-ink-2 hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn btn-primary h-8 px-3 text-sm"
            >
              Create account
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
