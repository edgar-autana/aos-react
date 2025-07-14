import { Contact, ContactPayload } from "@/types/contact/contact";
import ContactDetailsForm from "./contact-details-form";

interface ContactDetailsTabProps {
  contact: Contact;
  onFormSubmit: (formData: ContactPayload) => Promise<void>;
  isLoading: boolean;
}

export default function ContactDetailsTab({
  contact,
  onFormSubmit,
  isLoading
}: ContactDetailsTabProps) {
  return (
    <div className="space-y-6">
      <ContactDetailsForm
        contact={contact}
        onSubmit={onFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
} 