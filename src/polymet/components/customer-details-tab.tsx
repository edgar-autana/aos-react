import { Company } from "@/lib/supabase";
import CustomerDetailsForm from "./customer-details-form";

interface CustomerDetailsTabProps {
  customer: Company;
  onFormSubmit: (formData: any) => Promise<void>;
  onPresentationUpload: (file: File) => Promise<void>;
  onPresentationRemove: () => Promise<void>;
  isLoading: boolean;
}

export default function CustomerDetailsTab({
  customer,
  onFormSubmit,
  onPresentationUpload,
  onPresentationRemove,
  isLoading
}: CustomerDetailsTabProps) {
  return (
    <div className="space-y-6">
      <CustomerDetailsForm
        company={customer}
        onSubmit={onFormSubmit}
        onCancel={() => {}}
        isLoading={isLoading}
        onPresentationUpload={onPresentationUpload}
        onPresentationRemove={onPresentationRemove}
      />
    </div>
  );
} 