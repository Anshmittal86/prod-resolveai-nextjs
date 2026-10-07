import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StaffLoginForm } from "@/components/auth/staff-login-form";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/session";
import { isStaff } from "@/lib/staff-auth";

// Unlisted: nothing links here and search engines are asked to skip it.
export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default async function StaffLoginPage() {
  // A signed-in customer still sees the form so a staff member sharing the
  // browser can switch accounts.
  const user = await getCurrentUser();
  if (user && isStaff(user)) {
    redirect("/admin");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Logo />
          <span className="rounded-md border border-line-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mute">
            Staff portal
          </span>
        </div>
        <div className="panel p-8">
          <h1 className="type-title">Staff sign in</h1>
          <p className="mt-1 mb-6 text-sm text-mute">
            Restricted to support agents and administrators.
          </p>
          <StaffLoginForm />
        </div>
      </div>
    </main>
  );
}
