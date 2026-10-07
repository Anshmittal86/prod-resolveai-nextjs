import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { isStaff } from "@/lib/staff-auth";
import { Logo } from "./logo";
import { SignOutButton } from "./sign-out-button";

// Chrome for the staff portal. Pages still guard access themselves; for anyone
// who isn't staff this renders the bare logo while the page redirects.
export async function StaffHeader() {
  const user = await getCurrentUser();
  const staff = user && isStaff(user) ? user : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" aria-label="Ticket queue">
            <Logo />
          </Link>
          <span className="rounded-md border border-line-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mute">
            Staff
          </span>
        </div>

        {staff && (
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-on-ink"
            >
              {(staff.name || staff.email).charAt(0).toUpperCase()}
            </span>
            <div className="hidden min-w-0 text-sm leading-tight sm:block">
              <p className="truncate font-medium">{staff.name}</p>
              <p className="truncate text-xs capitalize text-mute">{staff.role}</p>
            </div>
            <SignOutButton redirectTo="/admin/login" />
          </div>
        )}
      </nav>
    </header>
  );
}
