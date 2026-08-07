import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function GuestLayout() {
  const { user, isLoading } = useAuth();
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

  // Redirect authenticated users to the dashboard,
  // except on /update-password which must handle the recovery flow itself.
  if (user && location.pathname !== "/update-password") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header for guest pages */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center">
            <img src="/lightmodelogo.png" alt="Synapse AI" className="h-[38px] w-auto block dark:hidden" />
            <img src="/darkmodelogo.png" alt="Synapse AI" className="hidden h-[38px] w-auto dark:block" />
          </a>
          <nav className="flex items-center gap-4" aria-label="Guest navigation">
            <ThemeToggle />
            <a
              href="/login"
              className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors duration-200 cursor-pointer"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90 transition-all duration-200 cursor-pointer"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="animate-page-enter" key={window.location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}