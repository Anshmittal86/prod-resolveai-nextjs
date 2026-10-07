import { PageLoader } from "@/components/loader";

// Fallback for any route without a closer loading.tsx, e.g. the staff sign-in.
export default function Loading() {
  return <PageLoader className="min-h-dvh" />;
}
