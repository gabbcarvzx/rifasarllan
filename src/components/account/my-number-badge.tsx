import { Badge } from "@/components/ui/badge";
import {
  numberStatusLabels,
  numberStatusVariants,
} from "@/lib/account/status";
import type { MyNumber } from "@/types/account";

export function MyNumberBadge({ entry }: { entry: MyNumber }) {
  return (
    <div className="flex min-w-24 flex-col items-center gap-2 rounded-lg border border-white/10 bg-black/18 p-3">
      <span className="font-mono text-lg font-bold text-foreground">
        {entry.number}
      </span>
      <Badge
        variant={numberStatusVariants[entry.status]}
        className="px-2 py-0.5 text-[10px]"
      >
        {numberStatusLabels[entry.status]}
      </Badge>
    </div>
  );
}
