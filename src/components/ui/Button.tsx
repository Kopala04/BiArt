import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "bg-accent text-white shadow-sm shadow-black/10 hover:bg-[color:var(--brand-light)] dark:text-[#1f2622] dark:hover:bg-[color:var(--brand-light)]",
      secondary:
        "bg-[color:var(--brand-dark)] text-white hover:bg-[color:var(--accent)] dark:bg-surface-muted dark:text-foreground dark:hover:bg-surface",
      outline:
        "border border-border bg-transparent text-foreground hover:bg-surface-muted",
      ghost: "bg-transparent text-muted hover:bg-surface-muted hover:text-foreground",
      danger: "bg-red-600 text-white hover:bg-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
