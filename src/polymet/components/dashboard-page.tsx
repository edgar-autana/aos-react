import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BarChartIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";
import { CNC_ORDERS, CncOrder } from "@/polymet/data/cnc-orders-data";
import OrderListItem from "@/polymet/components/order-list-item";
import StatusBadge from "@/polymet/components/status-badge";

export default function DashboardPage() {
  // Calculate statistics
  const totalOrders = CNC_ORDERS.length;
  const inProgressOrders = CNC_ORDERS.filter(
    (order) => order.status === "in-progress"
  ).length;
  const completedOrders = CNC_ORDERS.filter(
    (order) => order.status === "completed"
  ).length;
  const delayedOrders = CNC_ORDERS.filter((order) =>
    order.tasks.some((task) => task.status === "delayed")
  ).length;

  // Get recent orders (most recent first based on start date)
  const recentOrders = [...CNC_ORDERS]
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    .slice(0, 3);

  // Get upcoming tasks (tasks that are pending or in progress)
  const upcomingTasks = CNC_ORDERS.flatMap((order) =>
    order.tasks
      .filter(
        (task) => task.status === "pending" || task.status === "in-progress"
      )
      .map((task) => ({
        ...task,
        orderNumber: order.orderNumber,
        orderId: order.id,
      }))
  )
    .sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your CNC manufacturing orders
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          description="All time orders"
          icon={BarChartIcon}
        />

        <StatsCard
          title="In Progress"
          value={inProgressOrders}
          description="Currently being processed"
          icon={ClockIcon}
          iconColor="text-blue-500"
        />

        <StatsCard
          title="Completed"
          value={completedOrders}
          description="Successfully delivered"
          icon={CheckCircleIcon}
          iconColor="text-green-500"
        />

        <StatsCard
          title="Delayed"
          value={delayedOrders}
          description="Experiencing delays"
          icon={CalendarIcon}
          iconColor="text-amber-500"
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link to="/orders">
            <Button variant="ghost" className="text-sm">
              View All
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {recentOrders.map((order) => (
            <OrderListItem key={order.id} order={order} />
          ))}
        </div>
      </div>

      {/* Upcoming tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <div className="font-medium">{task.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Order #{task.orderNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Due Date
                        </div>
                        <div>{formatDate(task.endDate)}</div>
                      </div>
                      <StatusBadge status={task.status} />

                      <Link to={`/orders/${task.orderId}`}>
                        <Button size="sm" variant="ghost">
                          <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No upcoming tasks
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  iconColor?: string;
}

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-primary",
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
