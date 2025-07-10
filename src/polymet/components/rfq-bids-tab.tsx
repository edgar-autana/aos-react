import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendIcon } from "lucide-react";

interface RfqBidsTabProps {
  rfqId: string;
}

export default function RfqBidsTab({ rfqId }: RfqBidsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <SendIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Bids Management</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Bid management functionality will be implemented here. This will include 
              bid competitions, supplier invitations, and received bids.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 