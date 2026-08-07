import { LogOut, Menu, X, User, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isDemo?: boolean;
}

export default function Navbar({ onToggleSidebar, isSidebarOpen, isDemo }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userAvatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const userInitial = userAvatarUrl
    ? null
    : user?.user_metadata?.full_name
      ? (user.user_metadata.full_name as string).charAt(0).toUpperCase()
      : user?.email?.charAt(0).toUpperCase() ?? "U";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/60 hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer lg:hidden"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile / Tablet logo — same image as desktop sidebar, only smaller */}
        <a href={isDemo ? "/demo" : "/dashboard"} className="flex items-center lg:hidden">
          <img
            src="/lightmodelogo.png"
            alt="Synapse AI"
            className="h-[32px] w-auto sm:h-[38px] block dark:hidden"
          />
          <img
            src="/darkmodelogo.png"
            alt="Synapse AI"
            className="hidden h-[32px] w-auto sm:h-[38px] dark:block"
          />
        </a>

        {/* Back to Landing (demo mode only, hidden on mobile) */}
        {isDemo && (
          <a
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/50 hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Landing
          </a>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Demo Mode badge (hidden on mobile) */}
        {isDemo && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent whitespace-nowrap">
            <Sparkles size={12} />
            Demo Mode
          </span>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell isDemo={isDemo} />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors duration-200 cursor-pointer"
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-medium text-white">
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt="Your avatar" className="h-full w-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-border bg-card shadow-lg py-1">
                {user && (
                  <div className="border-b border-border px-4 py-2.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {(user.user_metadata?.full_name as string | undefined) ?? "Synapse AI User"}
                    </p>
                    <p className="truncate text-xs text-foreground/50">{user.email}</p>
                  </div>
                )}
                <a
                  href={isDemo ? "/demo/profile" : "/profile"}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors duration-200 cursor-pointer"
                >
                  <User size={16} />
                  Profile
                </a>
                <hr className="my-1 border-border" />
                {isDemo ? (
                  <a
                    href="/"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors duration-200 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Exit Demo
                  </a>
                ) : (
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors duration-200 cursor-pointer text-left"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}