import { useRfqWithCompany } from "@/hooks/rfq/useRfqs";
import { PageLoading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RfqEditForm from "./rfq-edit-form";

interface RfqInfoTabProps {
  rfqId: string;
}

export default function RfqInfoTab({ rfqId }: RfqInfoTabProps) {
  const { rfq, loading, error } = useRfqWithCompany(rfqId);

  if (loading) {
    return <PageLoading text="Loading RFQ details..." />;
  }

  if (error || !rfq) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || "Failed to load RFQ details"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <RfqEditForm rfq={rfq} />
    </div>
  );
} 