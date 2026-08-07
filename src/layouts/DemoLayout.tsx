import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { DemoModeProvider } from "../context/DemoMode";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";

export default function DemoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();

  return (
    <DemoModeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          linkPrefix="/demo"
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar
            isDemo
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            isSidebarOpen={sidebarOpen}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="animate-page-enter" key={window.location.pathname}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </DemoModeProvider>
  );
}