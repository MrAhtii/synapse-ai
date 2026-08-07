import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef, ElementType } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps<T extends ElementType = "button"> = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  as?: T;
} & (T extends "a"
  ? AnchorHTMLAttributes<HTMLAnchorElement>
  : ButtonHTMLAttributes<HTMLButtonElement>);

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:opacity-90 hover:shadow-md hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  secondary:
    "bg-secondary text-white hover:opacity-90 hover:shadow-md hover:shadow-secondary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-ring",
  ghost:
    "bg-transparent text-foreground hover:bg-muted hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring",
  destructive:
    "bg-destructive text-white hover:opacity-90 hover:shadow-md hover:shadow-destructive/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

const commonClasses = (variant: ButtonVariant, size: ButtonSize, className: string) =>
  `
    inline-flex items-center justify-center gap-2 rounded-lg font-semibold
    transition-all duration-200 ease-out
    cursor-pointer active:scale-[0.96]
    hover:scale-[1.02]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `.trim();

function ButtonInner(
  props: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>
) {
  const {
    variant = "primary",
    size = "md",
    isLoading = false,
    as: Tag = "button",
    className = "",
    children,
    disabled,
    ...rest
  } = props as any;

  const disabledOrLoading = disabled || isLoading;

  return (
    <Tag
      ref={ref}
      disabled={Tag === "button" ? disabledOrLoading : undefined}
      aria-disabled={Tag === "a" && disabledOrLoading ? true : undefined}
      className={commonClasses(variant, size, className)}
      {...(Tag === "a" && disabledOrLoading ? { onClick: (e: Event) => e.preventDefault() } : {})}
      {...rest}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </Tag>
  );
}

interface ButtonComponent {
  <T extends ElementType = "button">(
    props: ButtonProps<T> & { ref?: React.ForwardedRef<HTMLElement> }
  ): ReturnType<typeof ButtonInner>;
  displayName: string;
}

const Button = forwardRef(ButtonInner) as unknown as ButtonComponent;

Button.displayName = "Button";

export default Button;