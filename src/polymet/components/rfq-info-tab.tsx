import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

interface RfqInfoTabProps {
  rfqId: string;
}

export default function RfqInfoTab({ rfqId }: RfqInfoTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RFQ Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <InfoIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">RFQ Details & History</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Detailed RFQ information, history, documents, and additional metadata 
              will be displayed here. This includes timeline, status changes, and 
              related documentation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 