import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { mode, resolved, setMode } = useTheme();

  // Determine the target mode when the user clicks.
  // If the user's preference is "system", we toggle based on the resolved theme.
  const isCurrentlyDark = mode === "dark" || (mode === "system" && resolved === "dark");

  const handleToggle = () => {
    setMode(isCurrentlyDark ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggle}
      className="relative inline-flex items-center justify-center rounded-lg p-2 text-foreground/60 hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
      aria-label={isCurrentlyDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isCurrentlyDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        size={20}
        className={`absolute transition-all duration-300 ease-out ${
          isCurrentlyDark ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <Moon
        size={20}
        className={`transition-all duration-300 ease-out ${
          isCurrentlyDark ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
    </button>
  );
}