import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  CalendarIcon,
  FileTextIcon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { useRfqWithCompany } from "@/hooks/rfq/useRfqs";
import { getRfqDisplayName, getRfqStatusColor, getRfqStatusText, formatRfqDate } from "@/utils/rfq/rfqUtils";
import RfqPnsTab from "@/polymet/components/rfq-pns-tab";
import RfqBidsTab from "@/polymet/components/rfq-bids-tab";
import RfqInfoTab from "@/polymet/components/rfq-info-tab";

export default function RfqDetailsPage() {
  const { rfqId = "" } = useParams();
  const navigate = useNavigate();

  const { rfq, loading, error } = useRfqWithCompany(rfqId);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Loading state
  if (loading) {
    return <PageLoading text="Loading RFQ details..." />;
  }

  // Error or not found state
  if (error || !rfq) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/rfqs">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">RFQ Not Found</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">RFQ Not Found</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              {error || "The RFQ you're looking for doesn't exist or has been removed."}
            </CardDescription>
            <Button asChild>
              <Link to="/rfqs">Return to RFQs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const company = rfq.company_info;

  return (
    <div className="container mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="pl-0 mb-2" onClick={() => navigate(`/customers/${rfq.company}`)}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Company
      </Button>

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">RFQ Details</h1>
      </div>

      {/* RFQ Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{getRfqDisplayName(rfq)}</h2>
                <Badge className={getRfqStatusColor(rfq.status)}>
                  {getRfqStatusText(rfq.status)}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <div className="flex items-center gap-2">
                    {company && (
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={company.image || undefined} />
                        <AvatarFallback>
                          {company.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span>
                      {company?.name || "Unknown Customer"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Created: {formatDate(rfq.created_at)}</span>
                </div>
                {rfq.due_date && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Due: {formatRfqDate(rfq.due_date)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/rfqs/${rfq.id}/edit`}>Edit RFQ</Link>
              </Button>
              <Button variant="default">Generate Quote</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pns" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="pns">PNs</TabsTrigger>
          <TabsTrigger value="bids">BIDs</TabsTrigger>
          <TabsTrigger value="info">INFO</TabsTrigger>
        </TabsList>

        <TabsContent value="pns" className="space-y-6 mt-6">
          <RfqPnsTab rfqId={rfqId} />
        </TabsContent>

        <TabsContent value="bids" className="space-y-6 mt-6">
          <RfqBidsTab rfqId={rfqId} />
        </TabsContent>

        <TabsContent value="info" className="space-y-6 mt-6">
          <RfqInfoTab rfqId={rfqId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
