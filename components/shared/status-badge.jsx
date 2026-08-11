import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META, PAYMENT_STATUS_META } from "@/lib/constants";

const META_BY_TYPE = {
  application: APPLICATION_STATUS_META,
  payment: PAYMENT_STATUS_META,
};

/**
 * @param {{ status: string, type?: 'application' | 'payment' }} props
 */
export function StatusBadge({ status, type = "application" }) {
  const meta = META_BY_TYPE[type]?.[status];

  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", meta?.className)}>
      {meta?.label ?? status}
    </Badge>
  );
}
