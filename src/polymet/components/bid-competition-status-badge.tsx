import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BidCompetitionStatus = "draft" | "active" | "closed";

interface BidCompetitionStatusBadgeProps {
  status: BidCompetitionStatus;
  className?: string;
}

export default function BidCompetitionStatusBadge({
  status,
  className,
}: BidCompetitionStatusBadgeProps) {
  const statusColors: Record<BidCompetitionStatus, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    closed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  };

  return (
    <Badge className={cn(statusColors[status], className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
