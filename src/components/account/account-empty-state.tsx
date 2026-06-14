import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";

type AccountEmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function AccountEmptyState(props: AccountEmptyStateProps) {
  return <EmptyState {...props} className="bg-surface-raised/55" />;
}
