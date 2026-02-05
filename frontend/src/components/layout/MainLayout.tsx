import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 dark">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-white/10 bg-black/40 backdrop-blur-xl px-4">
            <SidebarTrigger className="text-white" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-8 bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
