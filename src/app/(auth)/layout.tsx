import { SiteHeader } from "@/components/site-header";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-paper p-4">
        <div className="panel w-full max-w-md p-8">
          {children}
        </div>
      </main>
    </>
  );
}
