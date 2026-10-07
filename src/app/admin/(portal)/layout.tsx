import { StaffHeader } from "@/components/staff-header";

// Signed-in staff screens. The staff sign-in sits outside this group, so it
// keeps its own full-screen layout.
export default function StaffPortalLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <StaffHeader />
      {children}
    </>
  );
}
