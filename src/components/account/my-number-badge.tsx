import { Badge } from "@/components/ui/badge";
import {
  numberStatusLabels,
  numberStatusVariants,
} from "@/lib/account/status";
import type { MyNumber } from "@/types/account";

export function MyNumberBadge({ entry }: { entry: MyNumber }) {
  return (
    <div className="flex min-w-24 flex-col items-center gap-2 rounded-[var(--radius-sm)] border border-border/80 bg-surface-raised/60 p-3 text-center transition hover:border-primary/30 hover:bg-primary/[0.08]">
      <span className="font-mono text-lg font-bold text-foreground">
        {entry.number}
      </span>
      <Badge
        variant={numberStatusVariants[entry.status]}
        className="px-2 py-0.5 text-[10px]"
      >
        {numberStatusLabels[entry.status]}
      </Badge>
      <span className="text-[11px] font-medium text-muted">
        Pedido {entry.orderId.slice(0, 8)}
      </span>
    </div>
  );
}
