import { formatDistanceToNow } from "date-fns";
import { MailIcon, UsersIcon, FileTextIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import BidCompetitionStatusBadge from "@/polymet/components/bid-competition-status-badge";
import { BidCompetition } from "@/polymet/data/bids-data";

interface BidCompetitionListItemProps {
  competition: BidCompetition;
  rfqId: string;
}

export default function BidCompetitionListItem({
  competition,
  rfqId,
}: BidCompetitionListItemProps) {
  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{competition.name}</h3>
              <BidCompetitionStatusBadge status={competition.status} />
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {competition.description}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(competition.createdDate)}</span>
              <span className="text-muted-foreground ml-2">Closes:</span>
              <span>
                {competition.status === "closed"
                  ? "Closed"
                  : formatDate(competition.closingDate)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />

                <span>{competition.invitedSuppliers.length} invited</span>
              </div>
              <div className="flex items-center gap-1">
                <MailIcon className="h-4 w-4 text-muted-foreground" />

                <span>
                  {competition.emailsOpened}/{competition.emailsSent} opened
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />

                <span>{competition.bidsReceived} bids</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/rfqs/${rfqId}/competitions/${competition.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
