import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, ArrowLeftIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CustomerSelect from "@/polymet/components/customer-select";
import BulkFileUpload, {
  UploadedFile,
} from "@/polymet/components/bulk-file-upload";

export default function CreateRfqPage() {
  const navigate = useNavigate();
  const [rfqName, setRfqName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Navigate to the RFQs list page after successful creation
    // In a real app, you might navigate to the newly created RFQ's detail page
    navigate("/rfqs");
  };

  const isFormValid =
    rfqName && selectedCustomerId && dueDate && uploadedFiles.length > 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/rfqs")}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create New RFQ</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>RFQ Details</CardTitle>
            <CardDescription>
              Enter the basic information for this Request for Quote
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rfq-name">RFQ Name</Label>
              <Input
                id="rfq-name"
                placeholder="Enter a descriptive name for this RFQ"
                value={rfqName}
                onChange={(e) => setRfqName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <CustomerSelect
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={setSelectedCustomerId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {dueDate ? format(dueDate, "PPP") : "Select a due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Upload 2D PDF drawings and 3D CAD models for the parts in this RFQ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BulkFileUpload
              uploadedFiles={uploadedFiles}
              onFilesChange={setUploadedFiles}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
            <CardDescription>
              Review the information below and create your RFQ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">RFQ Summary</h3>
              <div className="rounded-md bg-muted p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="text-sm font-medium">
                    {rfqName || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Customer:
                  </span>
                  <span className="text-sm font-medium">
                    {selectedCustomerId ? "Selected" : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Due Date:
                  </span>
                  <span className="text-sm font-medium">
                    {dueDate ? format(dueDate, "PPP") : "Not specified"}
                  </span>
                </div>
                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Files Uploaded:
                  </span>
                  <span className="text-sm font-medium">
                    {uploadedFiles.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Parts to Create:
                  </span>
                  <span className="text-sm font-medium">
                    {uploadedFiles.length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/rfqs")}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Create RFQ
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
