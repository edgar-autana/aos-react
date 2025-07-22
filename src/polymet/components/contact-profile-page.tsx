import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PhoneIcon,
  MailIcon,
  LinkedinIcon,
  UserIcon,
  CalendarIcon,
  Building2Icon,
  TruckIcon,
  SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contactApi } from "@/services/contact/contactApi";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useSuppliers } from "@/hooks/supplier/useSuppliers";
import { Contact, ContactPayload } from "@/types/contact/contact";
import { PageLoading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";
import { s3Service, validateImageFile } from "@/lib/s3";
import ContactDetailsTab from "./contact-details-tab";

export default function ContactProfilePage() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companies } = useCompanies();
  const { suppliers } = useSuppliers();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch contact data by ID
  useEffect(() => {
    const fetchContact = async () => {
      if (!contactId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await contactApi.getById(contactId);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setContact(response.data);
        } else {
          setError("Contact not found");
        }
      } catch (err) {
        setError("Failed to load contact data");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId]);

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !contactId) return;
    
    const file = e.target.files[0];
    
    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }
    
    setImageUploading(true);
    setError(null);
    
    try {
      // Upload image to S3
      const uploadResult = await s3Service.uploadContactImage(file, contactId);
      
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload image');
        return;
      }
      
      // Update contact image URL in database
      const updateData = { image: uploadResult.url };
      const response = await contactApi.update(contactId, updateData);
      
      if (response.error) {
        setError(response.error);
        // If database update fails, clean up uploaded file
        if (uploadResult.key) {
          await s3Service.deleteFile(uploadResult.key);
        }
      } else if (response.data) {
        // Update local state with new image URL
        setContact(response.data);
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
      console.error('Avatar upload error:', err);
    } finally {
      setImageUploading(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData: ContactPayload) => {
    if (!contact) return;
    
    setSaveLoading(true);
    
    try {
      const response = await contactApi.update(contact.id, formData);
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else if (response.data) {
        setContact(response.data);
        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (contact: Contact) => {
    const firstName = contact.name || "";
    const lastName = contact.last_name || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "C";
  };

  // Get company name from ID
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return null;
    const company = companies.find(c => c.id === companyId);
    return company?.name || null;
  };

  // Get supplier name from ID
  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return null;
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || null;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return <PageLoading text="Loading contact data..." />;
  }

  // Error state
  if (error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Contact Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The contact you're looking for doesn't exist or has been removed."}
        </p>
        <Button variant="outline" onClick={() => navigate('/contacts')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Contacts
        </Button>
      </div>
    );
  }

  const companyName = getCompanyName(contact.company);
  const supplierName = getSupplierName(contact.supplier);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="pl-0 mb-2" onClick={() => navigate('/contacts')}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Contacts
      </Button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Contact header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative group">
          <Avatar className="h-20 w-20 border cursor-pointer transition-all duration-200 group-hover:opacity-80">
            {contact.image ? (
              <AvatarImage src={contact.image} alt={`${contact.name} ${contact.last_name}`} />
            ) : (
              <AvatarFallback className="text-xl">
                {getInitials(contact)}
              </AvatarFallback>
            )}
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={imageUploading}
          />
          {imageUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {contact.name} {contact.last_name}
            </h1>
            <Badge
              variant={contact.enabled ? "default" : "secondary"}
              className={
                contact.enabled
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
              }
            >
              {contact.enabled ? "Active" : "Inactive"}
            </Badge>
            {contact.main_contact && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Main Contact
              </Badge>
            )}
            {contact.invited && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Invited
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            {contact.email && (
              <div className="flex items-center gap-1">
                <MailIcon className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.linkedin && (
              <div className="flex items-center gap-1">
                <LinkedinIcon className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={contact.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            )}
            {companyName && (
              <div className="flex items-center gap-1">
                <Building2Icon className="h-4 w-4 text-muted-foreground" />
                <span>{companyName}</span>
              </div>
            )}
            {supplierName && (
              <div className="flex items-center gap-1">
                <TruckIcon className="h-4 w-4 text-muted-foreground" />
                <span>{supplierName}</span>
              </div>
            )}
            {contact.created_at_atos && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Created {formatDate(contact.created_at_atos)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact content */}
      <Tabs defaultValue="details" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="details">Contact Details</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <ContactDetailsTab
            contact={contact}
            onFormSubmit={handleFormSubmit}
            isLoading={saveLoading}
          />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <SettingsIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">No operations available</p>
                  <p className="text-sm">Operations functionality will be added in the future.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 