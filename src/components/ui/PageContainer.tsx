import { HTMLAttributes } from "react";

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export default function PageContainer({
  maxWidth = "xl",
  className = "",
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 ${maxWidthClasses[maxWidth]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}