import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CNC_ORDERS } from "@/polymet/data/cnc-orders-data";
import GanttChart from "@/polymet/components/gantt-chart";
import OrderProgressSummary from "@/polymet/components/order-progress-summary";
import OrderDetailsHeader from "@/polymet/components/order-details-header";
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function OrderDetailsPage() {
  const { orderId = "" } = useParams();

  // Find the order by ID
  const order = CNC_ORDERS.find((o) => o.id === orderId);

  // If order not found, show error state
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/orders">
          <Button>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/orders">
        <Button variant="ghost" className="pl-0 mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      {/* Order header */}
      <OrderDetailsHeader order={order} />

      {/* Order content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Progress summary */}
        <div>
          <OrderProgressSummary order={order} />
        </div>

        {/* Right column - Tabs with Gantt chart and details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="details">
                <ClockIcon className="h-4 w-4 mr-2" />
                Task Details
              </TabsTrigger>
            </TabsList>

            {/* Timeline tab - Gantt chart */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Production Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <GanttChart
                    tasks={order.tasks}
                    startDate={order.startDate}
                    endDate={order.estimatedEndDate}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details tab - Task list */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {index + 1}. {task.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(task.startDate)} -{" "}
                              {formatDate(task.endDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {task.progress}% Complete
                            </div>
                            <div className="text-sm">
                              Status:{" "}
                              <span className={getStatusColor(task.status)}>
                                {capitalizeFirstLetter(task.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
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

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-green-600 dark:text-green-400";
    case "in-progress":
      return "text-blue-600 dark:text-blue-400";
    case "delayed":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}
