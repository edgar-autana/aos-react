import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, ChevronRightIcon, FileTextIcon } from "lucide-react";
import StatusBadgeRfq from "@/polymet/components/status-badge-rfq";
import { RFQ } from "@/polymet/data/rfqs-data";
import { CUSTOMERS } from "@/polymet/data/customers-data";

interface RfqListItemProps {
  rfq: RFQ;
}

export default function RfqListItem({ rfq }: RfqListItemProps) {
  // Find the customer associated with this RFQ
  const customer = CUSTOMERS.find((c) => c.id === rfq.customerId);

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-lg">{rfq.name}</h3>
              <StatusBadgeRfq status={rfq.status} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={customer?.avatar} />

                  <AvatarFallback>
                    {customer?.name.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <span>{customer?.name || "Unknown Customer"}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />

                <span>Due: {formatDate(rfq.dueDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />

                <span>
                  {rfq.partNumbers.length} Part
                  {rfq.partNumbers.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <Button variant="outline" asChild className="sm:self-center">
            <Link to={`/rfqs/${rfq.id}`} className="flex items-center">
              View Details
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
