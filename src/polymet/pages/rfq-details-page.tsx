import { useState } from "react";
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
  PlusIcon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusBadgeRfq from "@/polymet/components/status-badge-rfq";
import PartNumberListItem from "@/polymet/components/part-number-list-item";
import { getRfqById } from "@/polymet/data/rfqs-data";
import { CUSTOMERS } from "@/polymet/data/customers-data";

export default function RfqDetailsPage() {
  const { rfqId = "" } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("parts");

  const rfq = getRfqById(rfqId);
  const customer = rfq
    ? CUSTOMERS.find((c) => c.id === rfq.customerId)
    : undefined;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (!rfq) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/rfqs")}>
            <ArrowLeftIcon className="h-4 w-4" />
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/rfqs")}>
          <ArrowLeftIcon className="h-4 w-4" />
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
            <div className="space-y-4">
              {rfq.partNumbers.map((part) => (
                <PartNumberListItem key={part.id} part={part} rfqId={rfq.id} />
              ))}
            </div>
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
    </div>
  );
}
