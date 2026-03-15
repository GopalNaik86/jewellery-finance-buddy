
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

export function AppLayout({ children }: { children: React.ReactNode }) {

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">

          <header className="h-14 flex items-center justify-between border-b bg-card px-4">

            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <span className="text-sm text-muted-foreground">
                Clothing Shop Inventory & Profit Tracker
              </span>
            </div>

            <div className="flex items-center gap-3">

              <span className="text-sm text-muted-foreground">
                {auth.currentUser?.email}
              </span>

              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white rounded-md"
              >
                Logout
              </button>

            </div>

          </header>

          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}

