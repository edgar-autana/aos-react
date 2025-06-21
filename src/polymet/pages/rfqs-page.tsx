import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon, SearchIcon, FileTextIcon } from "lucide-react";
import { RFQS } from "@/polymet/data/rfqs-data";
import { CUSTOMERS } from "@/polymet/data/customers-data";
import RfqListItem from "@/polymet/components/rfq-list-item";

type RfqStatus =
  | "all"
  | "draft"
  | "submitted"
  | "in-review"
  | "quoted"
  | "accepted"
  | "rejected";

export default function RfqsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RfqStatus>("all");

  // Calculate statistics
  const totalRfqs = RFQS.length;
  const draftRfqs = RFQS.filter((rfq) => rfq.status === "draft").length;
  const submittedRfqs = RFQS.filter((rfq) => rfq.status === "submitted").length;
  const inReviewRfqs = RFQS.filter((rfq) => rfq.status === "in-review").length;
  const quotedRfqs = RFQS.filter((rfq) => rfq.status === "quoted").length;
  const acceptedRfqs = RFQS.filter((rfq) => rfq.status === "accepted").length;
  const rejectedRfqs = RFQS.filter((rfq) => rfq.status === "rejected").length;

  // Filter RFQs based on search query and status filter
  const filteredRfqs = RFQS.filter((rfq) => {
    // Filter by status
    if (statusFilter !== "all" && rfq.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const customer = CUSTOMERS.find((c) => c.id === rfq.customerId);
      const searchLower = searchQuery.toLowerCase();

      return (
        rfq.name.toLowerCase().includes(searchLower) ||
        rfq.id.toLowerCase().includes(searchLower) ||
        customer?.name.toLowerCase().includes(searchLower) ||
        customer?.company.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Requests for Quote (RFQs)</h1>
        <Button asChild>
          <Link to="/rfqs/create" className="flex items-center">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New RFQ
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRfqs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inReviewRfqs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quoted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotedRfqs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedRfqs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search RFQs by name, ID, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as RfqStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* RFQ List */}
      <div className="space-y-4">
        {filteredRfqs.length > 0 ? (
          filteredRfqs.map((rfq) => <RfqListItem key={rfq.id} rfq={rfq} />)
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-background p-3 mb-4">
                <FileTextIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl mb-2">No RFQs Found</CardTitle>
              <CardDescription className="text-center max-w-md">
                {searchQuery || statusFilter !== "all"
                  ? "No RFQs match your current filters. Try adjusting your search or filter criteria."
                  : "There are no RFQs in the system yet. Create your first RFQ to get started."}
              </CardDescription>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild className="mt-4">
                  <Link to="/rfqs/create">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create New RFQ
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
