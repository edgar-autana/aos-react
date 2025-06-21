import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType =
  | "pending"
  | "in-progress"
  | "completed"
  | "delayed"
  | "cancelled";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        };
      case "in-progress":
        return {
          label: "In Progress",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
      case "completed":
        return {
          label: "Completed",
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
        };
      case "delayed":
        return {
          label: "Delayed",
          className:
            "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        };
    }
  };

  const { label, className: statusClassName } = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn("font-medium border", statusClassName, className)}
    >
      {label}
    </Badge>
  );
}
