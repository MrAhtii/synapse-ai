import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";

export default function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();
  const location = useLocation();

  // Show loading spinner while session is being restored
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-border border-t-primary" />
          <p className="text-sm text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarOpen={sidebarOpen}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-page-enter" key={window.location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}