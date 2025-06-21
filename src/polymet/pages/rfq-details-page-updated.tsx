import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  PlusIcon,
  UserIcon,
  BarChartIcon,
  FileIcon,
  EyeIcon,
  SendIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusBadgeRfq from "@/polymet/components/status-badge-rfq";
import DataTable from "@/polymet/components/data-table";
import { getRfqById } from "@/polymet/data/rfqs-data";
import { CUSTOMERS } from "@/polymet/data/customers-data";
import { Badge } from "@/components/ui/badge";
import {
  getBidsByRfqId,
  getBidCompetitionsByRfqId,
} from "@/polymet/data/bids-data";
import BidListItem from "@/polymet/components/bid-list-item";
import BidCompetitionListItem from "@/polymet/components/bid-competition-list-item";
import CreateBiddingCompetitionModal from "@/polymet/components/create-bidding-competition-modal";

export default function RfqDetailsPageUpdated() {
  const { rfqId = "" } = useParams();
  const [activeTab, setActiveTab] = useState("parts");
  const [createCompetitionModalOpen, setCreateCompetitionModalOpen] =
    useState(false);

  const rfq = getRfqById(rfqId);
  const customer = rfq
    ? CUSTOMERS.find((c) => c.id === rfq.customerId)
    : undefined;

  const bids = rfq ? getBidsByRfqId(rfq.id) : [];
  const bidCompetitions = rfq ? getBidCompetitionsByRfqId(rfq.id) : [];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleCreateCompetition = (data: {
    name: string;
    description: string;
    closingDate: Date;
    suppliers: string[];
  }) => {
    console.log("Creating competition with data:", data);
    // In a real app, this would call an API to create the competition
    setCreateCompetitionModalOpen(false);
    // For demo purposes, we could show a success message or refresh the data
    alert("Bidding competition created and invitations sent!");
  };

  if (!rfq) {
    return (
      <div className="container mx-auto py-6 space-y-6">
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
              The RFQ you're looking for doesn't exist or has been removed.
            </CardDescription>
            <Button asChild>
              <Link to="/rfqs">Return to RFQs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Define columns for the parts data table
  const columns = [
    {
      header: "Part Name",
      accessorKey: "name" as const,
      sortable: true,
    },
    {
      header: "Description",
      accessorKey: "description" as const,
      cell: (item: any) => (
        <div className="max-w-xs truncate">{item.description}</div>
      ),
    },
    {
      header: "Qty",
      accessorKey: "quantity" as const,
      sortable: true,
      className: "text-right",
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (item: any) => {
        const statusColors: Record<string, string> = {
          pending:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          "in-progress":
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          completed:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          cancelled:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };

        return (
          <Badge className={statusColors[item.status] || ""}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: "Files",
      accessorKey: "files" as const,
      cell: (item: any) => (
        <div className="flex gap-2">
          {item.files.drawingFile && (
            <span className="text-muted-foreground" title="Drawing available">
              <FileTextIcon className="h-4 w-4" />
            </span>
          )}
          {item.files.modelFile && (
            <span className="text-muted-foreground" title="3D Model available">
              <FileIcon className="h-4 w-4" />
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Analysis",
      accessorKey: "technicalAnalysisId" as const,
      cell: (item: any) =>
        item.technicalAnalysisId ? (
          <span className="text-green-600 dark:text-green-400">
            <BarChartIcon className="h-4 w-4" />
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/rfqs">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">RFQ Details</h1>
      </div>

      {/* RFQ Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{rfq.name}</h2>
                <StatusBadgeRfq status={rfq.status} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />

                  <div className="flex items-center gap-2">
                    {customer && (
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={customer.avatar} />

                        <AvatarFallback>
                          {customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span>
                      {customer ? customer.name : "Unknown Customer"}
                      {customer && ` (${customer.company})`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />

                  <span>Created: {formatDate(rfq.dateCreated)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />

                  <span>Due: {formatDate(rfq.dueDate)}</span>
                </div>
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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="parts">Part Numbers</TabsTrigger>
          <TabsTrigger value="bids">Bids</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="parts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">
              Part Numbers ({rfq.partNumbers.length})
            </h2>
            <Button asChild>
              <Link to={`/rfqs/${rfq.id}/add-part`}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Part
              </Link>
            </Button>
          </div>

          {rfq.partNumbers.length > 0 ? (
            <DataTable
              data={rfq.partNumbers}
              columns={columns}
              onRowClick={(part) => {
                console.warn(
                  "Prevented assignment: `window.location.href = `/rfqs/${rfq.id}/parts/${part.id}``"
                ) /*TODO: Do not use window.location for navigation. Use react-router instead.*/;
              }}
              rowActions={(part) => [
                {
                  label: "View Details",
                  onClick: () => {
                    console.warn(
                      "Prevented assignment: `window.location.href = `/rfqs/${rfq.id}/parts/${part.id}``"
                    ) /*TODO: Do not use window.location for navigation. Use react-router instead.*/;
                  },
                  icon: <EyeIcon className="h-4 w-4" />,
                },
                {
                  label: part.technicalAnalysisId
                    ? "View Analysis"
                    : "Analyze Part",
                  onClick: () => {
                    console.warn(
                      "Prevented assignment: `window.location.href = part.technicalAnalysisId ? `/rfqs/${rfq.id}/parts/${part.id}/analysis` : `/rfqs/${rfq.id}/parts/${part.id}/analyze``"
                    ) /*TODO: Do not use window.location for navigation. Use react-router instead.*/;
                  },
                  icon: <BarChartIcon className="h-4 w-4" />,
                },
              ]}
              searchable={true}
              searchPlaceholder="Search parts..."
              searchKeys={["name", "description"]}
            />
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileTextIcon className="h-8 w-8 text-muted-foreground mb-4" />

                <CardTitle className="text-lg mb-2">No Parts Added</CardTitle>
                <CardDescription className="text-center max-w-md mb-4">
                  This RFQ doesn't have any part numbers yet. Add parts to begin
                  the technical analysis process.
                </CardDescription>
                <Button asChild>
                  <Link to={`/rfqs/${rfq.id}/add-part`}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Part
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bids" className="space-y-6">
          {/* Bid Competitions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">
                Bidding Competitions ({bidCompetitions.length})
              </h2>
              <Button onClick={() => setCreateCompetitionModalOpen(true)}>
                <SendIcon className="h-4 w-4 mr-2" />
                Create Bidding Competition
              </Button>
            </div>

            {bidCompetitions.length > 0 ? (
              <div>
                {bidCompetitions.map((competition) => (
                  <BidCompetitionListItem
                    key={competition.id}
                    competition={competition}
                    rfqId={rfq.id}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <SendIcon className="h-8 w-8 text-muted-foreground mb-4" />

                  <CardTitle className="text-lg mb-2">
                    No Bidding Competitions
                  </CardTitle>
                  <CardDescription className="text-center max-w-md mb-4">
                    Create a bidding competition to invite suppliers to submit
                    quotes for this RFQ.
                  </CardDescription>
                  <Button onClick={() => setCreateCompetitionModalOpen(true)}>
                    <SendIcon className="h-4 w-4 mr-2" />
                    Create Bidding Competition
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bids Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">
              Received Bids ({bids.length})
            </h2>

            {bids.length > 0 ? (
              <div>
                {bids.map((bid) => (
                  <BidListItem key={bid.id} bid={bid} rfqId={rfq.id} />
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileTextIcon className="h-8 w-8 text-muted-foreground mb-4" />

                  <CardTitle className="text-lg mb-2">
                    No Bids Received
                  </CardTitle>
                  <CardDescription className="text-center max-w-md">
                    Once suppliers submit bids for this RFQ, they will appear
                    here.
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                View and manage documents related to this RFQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No documents have been uploaded for this RFQ yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>
                View the history of changes to this RFQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />

                  <div>
                    <p className="text-sm">
                      <span className="font-medium">RFQ Created</span> by Admin
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(rfq.dateCreated)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />

                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Status Changed</span> to{" "}
                      {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(rfq.dateCreated)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Bidding Competition Modal */}
      <CreateBiddingCompetitionModal
        open={createCompetitionModalOpen}
        onOpenChange={setCreateCompetitionModalOpen}
        rfq={rfq}
        onSubmit={handleCreateCompetition}
      />
    </div>
  );
}
