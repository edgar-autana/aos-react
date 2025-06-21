import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BidStatus =
  | "pending"
  | "submitted"
  | "accepted"
  | "rejected"
  | "negotiating";

interface BidStatusBadgeProps {
  status: BidStatus;
  className?: string;
}

export default function BidStatusBadge({
  status,
  className,
}: BidStatusBadgeProps) {
  const statusColors: Record<BidStatus, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    accepted:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    negotiating:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

  return (
    <Badge className={cn(statusColors[status], className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
