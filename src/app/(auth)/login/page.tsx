import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { redirectIfSignedIn } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  await redirectIfSignedIn();

  return (
    <>
      <h1 className="type-title">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-mute">
        Sign in to chat with support and track your tickets.
      </p>
      <LoginForm />
    </>
  );
}
