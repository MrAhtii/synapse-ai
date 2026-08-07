import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-card rounded-xl shadow-sm border border-border p-6
          transition-all duration-200 ease-out
          ${hover ? "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/10 cursor-pointer" : ""}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;