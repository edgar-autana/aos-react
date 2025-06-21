import { CalendarIcon, FileTextIcon, UserIcon } from "lucide-react";
import { CncOrder } from "@/polymet/data/cnc-orders-data";
import StatusBadge from "@/polymet/components/status-badge";

interface OrderDetailsHeaderProps {
  order: CncOrder;
}

export default function OrderDetailsHeader({ order }: OrderDetailsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Order title and status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Order #{order.orderNumber}
            <StatusBadge status={order.status} />
          </h1>
          <h2 className="text-xl font-medium text-muted-foreground mt-1">
            {order.projectName}
          </h2>
        </div>
      </div>

      {/* Order details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-muted-foreground" />

          <div>
            <div className="text-sm text-muted-foreground">Customer</div>
            <div className="font-medium">{order.customerName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />

          <div>
            <div className="text-sm text-muted-foreground">Timeline</div>
            <div className="font-medium">
              {formatDate(order.startDate)} -{" "}
              {formatDate(order.estimatedEndDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FileTextIcon className="h-5 w-5 text-muted-foreground" />

          <div>
            <div className="text-sm text-muted-foreground">Description</div>
            <div className="font-medium line-clamp-1">{order.description}</div>
          </div>
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
