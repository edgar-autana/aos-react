import { formatDistanceToNow } from "date-fns";
import { FileTextIcon, FileIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BidStatusBadge from "@/polymet/components/bid-status-badge";
import { Bid } from "@/polymet/data/bids-data";
import { SUPPLIERS } from "@/polymet/data/suppliers-data";

interface BidListItemProps {
  bid: Bid;
  rfqId: string;
}

export default function BidListItem({ bid, rfqId }: BidListItemProps) {
  const supplier = SUPPLIERS.find((s) => s.id === bid.supplierId);

  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={supplier?.avatar} />

                <AvatarFallback>
                  {supplier?.name.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{supplier?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {supplier?.company}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Submitted:</span>
              <span>{formatDate(bid.submissionDate)}</span>
              <span className="text-muted-foreground ml-2">Expires:</span>
              <span>{formatDate(bid.expirationDate)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BidStatusBadge status={bid.status} />

              <span className="font-bold text-lg">
                {formatCurrency(bid.totalAmount, bid.currency)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Documents:</span>
              <div className="flex items-center gap-1">
                {bid.documents.map((doc) => (
                  <span
                    key={doc.id}
                    className="text-muted-foreground"
                    title={doc.name}
                  >
                    {doc.type === "quote" ? (
                      <FileTextIcon className="h-4 w-4" />
                    ) : (
                      <FileIcon className="h-4 w-4" />
                    )}
                  </span>
                ))}
              </div>
              <span className="text-muted-foreground ml-2">Items:</span>
              <span>{bid.items.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/rfqs/${rfqId}/bids/${bid.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
