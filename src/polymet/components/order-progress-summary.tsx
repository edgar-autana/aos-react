import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircleIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";
import { CncOrder, CncOrderTask } from "@/polymet/data/cnc-orders-data";
import StatusBadge from "@/polymet/components/status-badge";

interface OrderProgressSummaryProps {
  order: CncOrder;
}

export default function OrderProgressSummary({
  order,
}: OrderProgressSummaryProps) {
  // Calculate task statistics
  const taskStats = {
    total: order.tasks.length,
    completed: order.tasks.filter((task) => task.status === "completed").length,
    inProgress: order.tasks.filter((task) => task.status === "in-progress")
      .length,
    delayed: order.tasks.filter((task) => task.status === "delayed").length,
    pending: order.tasks.filter((task) => task.status === "pending").length,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Order Progress</CardTitle>
            <CardDescription>Current status of your order</CardDescription>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall progress */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-medium">{order.progress}%</span>
            </div>
            <Progress value={order.progress} className="h-2" />
          </div>

          {/* Task statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mb-1" />

              <span className="text-lg font-bold">{taskStats.completed}</span>
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>

            <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <ClockIcon className="h-5 w-5 text-blue-500 mb-1" />

              <span className="text-lg font-bold">{taskStats.inProgress}</span>
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>

            <div className="flex flex-col items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <AlertTriangleIcon className="h-5 w-5 text-amber-500 mb-1" />

              <span className="text-lg font-bold">{taskStats.delayed}</span>
              <span className="text-xs text-muted-foreground">Delayed</span>
            </div>

            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="h-5 w-5 rounded-full border-2 border-gray-400 mb-1" />

              <span className="text-lg font-bold">{taskStats.pending}</span>
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
          </div>

          {/* Timeline info */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{formatDate(order.startDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Estimated Completion:
              </span>
              <span className="font-medium">
                {formatDate(order.estimatedEndDate)}
              </span>
            </div>
            {order.actualEndDate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Actual Completion:
                </span>
                <span className="font-medium">
                  {formatDate(order.actualEndDate)}
                </span>
              </div>
            )}
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
