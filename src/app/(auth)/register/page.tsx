import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { redirectIfSignedIn } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function RegisterPage() {
  await redirectIfSignedIn();

  return (
    <>
      <h1 className="type-title">Create your account</h1>
      <p className="mt-1 mb-6 text-sm text-mute">
        Get instant help from our AI assistant and support team.
      </p>
      <RegisterForm />
    </>
  );
}
