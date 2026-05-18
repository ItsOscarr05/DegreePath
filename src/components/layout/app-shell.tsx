import { AppNavigation } from "@/components/layout/app-navigation";

export function AppShell({
  children,
  email,
  avatarUrl,
}: {
  children: React.ReactNode;
  email?: string;
  avatarUrl?: string | null;
}) {
  return (
    <div className="flex min-h-screen bg-stitch-bg font-sans text-stitch-onSurface">
      <AppNavigation email={email} avatarUrl={avatarUrl} />
      <main className="min-h-screen w-full flex-1 md:ml-64">
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-24 pt-24 md:px-10 md:pb-10 md:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
