import { Loader } from "@/components/loader";

// Rendered inside the auth card, so it only needs vertical room.
export default function Loading() {
  return (
    <div className="flex justify-center py-12">
      <Loader />
    </div>
  );
}
