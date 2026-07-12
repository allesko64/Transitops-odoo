import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ExportCsvButton({
  href,
  label = "Export CSV",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <a href={href} className={cn(buttonVariants({ variant: "outline" }), className)}>
      {label}
    </a>
  );
}
