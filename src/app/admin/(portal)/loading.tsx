import { PageLoader } from "@/components/loader";

// Shown under the staff header while the queue or a ticket loads.
export default function Loading() {
  return <PageLoader label="Loading queue" />;
}
