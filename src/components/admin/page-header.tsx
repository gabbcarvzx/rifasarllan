import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <SectionHeading
      eyebrow={eyebrow}
      title={title}
      description={description}
      action={actions ? <div className="flex flex-wrap gap-2">{actions}</div> : undefined}
      className={cn(className)}
    />
  );
}
