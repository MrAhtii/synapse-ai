import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export default function Loading({ size = "md", text }: LoadingProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-label={text || "Loading"}
    >
      <div className="relative">
        <div
          className={`
            ${sizeMap[size]}
            rounded-full border-2 border-primary/10
          `.trim()}
        />
        <Loader2
          size={size === "sm" ? 20 : size === "lg" ? 48 : 32}
          className={`absolute inset-0 animate-spin text-primary ${sizeMap[size]}`}
        />
      </div>
      {text && (
        <p className={`${textSizeMap[size]} font-medium text-foreground/60 animate-pulse`}>
          {text}
        </p>
      )}
      <span className="sr-only">{text || "Loading"}</span>
    </div>
  );
}