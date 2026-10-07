"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";

export function SignOutButton({
  redirectTo = "/login",
}: {
  redirectTo?: "/login" | "/admin/login";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSignOut() {
    setPending(true);
    setFailed(false);
    const { error } = await signOut();
    if (error) {
      setFailed(true);
      setPending(false);
      return;
    }
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {failed && (
        <span role="alert" className="text-sm text-danger">
          Sign out failed.
        </span>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="btn btn-ghost h-8 px-3 text-sm"
      >
        {pending ? "Signing out..." : failed ? "Try again" : "Sign out"}
      </button>
    </div>
  );
}
