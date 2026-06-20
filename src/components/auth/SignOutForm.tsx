import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export function SignOutForm({
  label,
  variant = "outline",
  size,
  className,
}: {
  label: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
      className={className}
    >
      <Button type="submit" variant={variant} size={size}>
        {label}
      </Button>
    </form>
  );
}
