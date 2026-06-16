import { Sidebar } from "@/components/Sidebar";
import { SyncStatus } from "@/components/SyncStatus";
import { StoreProvider } from "@/lib/store";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="pl-64">
          <div className="mx-auto min-h-screen max-w-[1600px] px-6 py-7 sm:px-8">
            <SyncStatus />
            {children}
          </div>
        </main>
      </div>
    </StoreProvider>
  );
}
