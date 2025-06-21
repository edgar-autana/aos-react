import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRightIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { CncOrder } from "@/polymet/data/cnc-orders-data";
import StatusBadge from "@/polymet/components/status-badge";
import { Link } from "react-router-dom";
import { useState } from "react";

interface OrderListItemProps {
  order: CncOrder;
}

export default function OrderListItem({ order }: OrderListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine if order is approaching due date (within 3 days)
  const isApproachingDue = () => {
    const dueDate = new Date(order.estimatedEndDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0 && order.status !== "completed";
  };

  // Determine priority indicator
  const getPriorityIndicator = () => {
    if (order.status === "completed") {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
          <CheckCircleIcon className="h-4 w-4 mr-1" />

          <span>Completed</span>
        </div>
      );
    } else if (order.status === "delayed") {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
          <AlertCircleIcon className="h-4 w-4 mr-1" />

          <span>Delayed</span>
        </div>
      );
    } else if (isApproachingDue()) {
      return (
        <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium">
          <ClockIcon className="h-4 w-4 mr-1" />

          <span>Due soon</span>
        </div>
      );
    }
    return null;
  };

  // Calculate progress color
  const getProgressColor = () => {
    if (order.status === "completed") return "bg-green-500";
    if (order.status === "delayed") return "bg-red-500";
    if (order.progress < 30) return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <Card
      className={`transition-all duration-300 ${
        isHovered
          ? "shadow-lg transform -translate-y-1 border-primary/20"
          : "hover:shadow-md"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div
          className={`relative overflow-hidden rounded-t-lg h-1 ${
            order.status === "completed"
              ? "bg-green-100 dark:bg-green-900/30"
              : order.status === "delayed"
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-blue-100 dark:bg-blue-900/30"
          }`}
        >
          <div
            className={`h-full ${getProgressColor()}`}
            style={{
              width: `${order.progress}%`,
              transition: "width 1s ease-in-out",
            }}
          />
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Order info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-medium text-lg transition-colors duration-300 ${
                    isHovered ? "text-primary" : ""
                  }`}
                >
                  Order #{order.orderNumber}
                </h3>
                <StatusBadge status={order.status} />
              </div>

              <div className="text-sm text-muted-foreground font-medium">
                {order.projectName}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Due:</span>
                  <span
                    className={`font-medium ${
                      isApproachingDue()
                        ? "text-amber-600 dark:text-amber-400"
                        : ""
                    }`}
                  >
                    {formatDate(order.estimatedEndDate)}
                  </span>
                </div>

                {getPriorityIndicator()}
              </div>
            </div>

            {/* Progress and action */}
            <div className="flex flex-col sm:items-end gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    order.status === "completed"
                      ? "text-green-600 dark:text-green-400"
                      : order.status === "delayed"
                        ? "text-red-600 dark:text-red-400"
                        : order.progress < 30
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {order.progress}%
                </span>
                <Progress
                  value={order.progress}
                  className="w-24 h-2 bg-gray-100 dark:bg-gray-800"
                  indicatorClassName={getProgressColor()}
                />
              </div>

              <Link
                to={`/orders/${order.id}`}
                className={`flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1 transition-all duration-300 ${
                  isHovered
                    ? "bg-primary text-primary-foreground"
                    : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                }`}
              >
                View Details
                <ArrowRightIcon
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isHovered ? "transform translate-x-1" : ""
                  }`}
                />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
