import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeIcon,
  Building2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/ui/summary-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { companyApi } from "@/services/company/companyApi";
import { Company } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { formatUrl } from "@/utils/urlUtils";
import { PageLoading } from "@/components/ui/loading";
import { s3Service, validateImageFile, validatePresentationFile } from "@/lib/s3";
import CustomerDetailsTab from "./customer-details-tab";
import CustomerRfqsTab from "./customer-rfqs-tab";
import CustomerPartNumbersTab from "./customer-part-numbers-tab";
import CustomerGlobalQuotationsTab from "./customer-global-quotations-tab";

export default function CustomerProfilePage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Company>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("rfqs");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch customer data by ID
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await companyApi.getById(customerId);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setCustomer(response.data);
          setForm(response.data);
        } else {
          setError("Customer not found");
        }
      } catch (err) {
        setError("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !customerId) return;
    
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
      const uploadResult = await s3Service.uploadCompanyImage(file, customerId);
      
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload image');
        return;
      }
      
      // Update company image URL in database
      const updateData = { image: uploadResult.url };
      const response = await companyApi.update(customerId, updateData);
      
      if (response.error) {
        setError(response.error);
        // If database update fails, clean up uploaded file
        if (uploadResult.key) {
          await s3Service.deleteFile(uploadResult.key);
        }
      } else if (response.data) {
        // Update local state with new image URL
        setCustomer(response.data);
        setForm(response.data);
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

  const handleDelete = async () => {
    if (!customerId) return;
    
    try {
      const response = await companyApi.delete(customerId);
      
      if (response.error) {
        setError(response.error);
      } else {
        navigate('/customers');
      }
    } catch (err) {
      setError("Failed to delete customer");
    }
  };

  const handleRemovePresentation = async () => {
    if (!customerId || !customer?.presentation) return;
    
    setSaveLoading(true);
    setError(null);
    
    try {
      // Extract the S3 key from the presentation URL
      const presentationUrl = customer.presentation;
      const bucketName = 'aos-files-bucket';
      const region = 'us-east-1';
      const baseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;
      
      if (presentationUrl.startsWith(baseUrl)) {
        const s3Key = presentationUrl.replace(baseUrl, '');
        
        // Remove from S3
        const deleteSuccess = await s3Service.deleteFile(s3Key);
        if (!deleteSuccess) {
          console.warn('Failed to delete file from S3, but continuing with database update');
        }
      }
      
      // Remove presentation URL from database
      const response = await companyApi.update(customerId, { presentation: "" });
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Update local state
        setCustomer(response.data);
        setForm(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove presentation";
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (!customerId) return;
    
    setSaveLoading(true);
    setError(null);
    
    try {
      // Prepare data for Supabase tb_company table
      const apiData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        url: formData.url || null,
        phone: formData.phone || null,
        status: formData.status,
        enabled: formData.enabled,
        address: formData.address || null,
        nda_signed: formData.nda_signed ? formData.nda_signed.toISOString() : null,
      };
      
      
      const response = await companyApi.update(customerId, apiData);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setCustomer(response.data);
        setForm(response.data);
        setIsEditing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update customer";
      setError(errorMessage);
      console.error('Exception during company update:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePresentationUpload = async (file: File) => {
    if (!customerId) return;
    
    setError(null);
    
    try {
      // Validate presentation file
      const validation = validatePresentationFile(file);
      if (!validation.valid) {
        setError(`Presentation file error: ${validation.error}`);
        throw new Error(validation.error);
      }
      
      // Upload presentation file to S3
      const uploadResult = await s3Service.uploadCompanyPresentation(file, customerId);
      
      if (uploadResult.success) {
        // Save presentation URL to database
        const presentationData = { presentation: uploadResult.url };
        const presentationResponse = await companyApi.update(customerId, presentationData);
        
        if (presentationResponse.error) {
          setError(`Failed to save presentation URL: ${presentationResponse.error}`);
          // Clean up uploaded file if database update fails
          if (uploadResult.key) {
            await s3Service.deleteFile(uploadResult.key);
          }
          throw new Error(presentationResponse.error);
        } else if (presentationResponse.data) {
          // Update local state with new presentation URL
          setCustomer(presentationResponse.data);
          setForm(presentationResponse.data);
        }
      } else {
        console.error('Presentation upload failed:', uploadResult.error);
        setError(`Failed to upload presentation: ${uploadResult.error}`);
        throw new Error(uploadResult.error);
      }
    } catch (err) {
      console.error('Presentation upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload presentation file';
      setError(errorMessage);
      throw err; // Re-throw to handle in the form component
    }
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
    return <PageLoading text="Loading customer data..." />;
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Customer Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The customer you're looking for doesn't exist or has been removed."}
        </p>
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="pl-0 mb-2" onClick={() => navigate('/customers')}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      {/* Customer header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative group">
          <Avatar className="h-20 w-20 border cursor-pointer transition-all duration-200 group-hover:opacity-80">
            {form.image ? (
              <AvatarImage src={form.image} alt={form.name || 'Company'} />
            ) : (
              <AvatarFallback className="text-xl">
                <Building2Icon className="h-8 w-8 text-muted-foreground" />
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
            <h1 className="text-2xl font-bold">{form.name || 'Unnamed Company'}</h1>
            {form.status && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                {form.status}
              </Badge>
            )}
            <Badge
              variant={form.enabled ? "default" : "secondary"}
              className={
                form.enabled
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
              }
            >
              {form.enabled ? "Active" : "Inactive"}
            </Badge>
            {form.nda_signed && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                NDA Signed
              </Badge>
            )}
            {form.presentation && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Presentation Available
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            {form.phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                <span>{form.phone}</span>
              </div>
            )}
            {form.address && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{form.address}</span>
              </div>
            )}
            {form.url && (
              <div className="flex items-center gap-1">
                <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={formatUrl(form.url)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {form.url}
                </a>
              </div>
            )}
            {form.created_at && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Created {formatDate(form.created_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div onClick={() => setActiveTab("rfqs")} className="cursor-pointer">
          <SummaryCard 
            title="RFQs"
            value={29}
            isActive={activeTab === "rfqs"}
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>}
          />
        </div>
        <div onClick={() => setActiveTab("part-numbers")} className="cursor-pointer">
          <SummaryCard 
            title="Part Numbers"
            value={157}
            isActive={activeTab === "part-numbers"}
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 014-4z" />
            </svg>}
          />
        </div>
        <SummaryCard 
          title="Quotes Sent"
          value={87}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        />
        <SummaryCard 
          title="Purchase Orders"
          value={0}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>}
        />
        <SummaryCard 
          title="Quoted Value"
          value="$2M"
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        />
      </div>

      {/* Customer content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rfqs" className="flex-1">RFQs</TabsTrigger>
          <TabsTrigger value="part-numbers" className="flex-1">Part Numbers</TabsTrigger>
          <TabsTrigger value="global-quotations" className="flex-1">Global Quotations</TabsTrigger>
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="rfqs" className="space-y-6 mt-6">
          <CustomerRfqsTab customerId={customerId!} />
        </TabsContent>

        <TabsContent value="part-numbers" className="space-y-6 mt-6">
          <CustomerPartNumbersTab customerId={customerId!} />
        </TabsContent>

        <TabsContent value="global-quotations" className="space-y-6 mt-6">
          <CustomerGlobalQuotationsTab customerId={customerId!} />
        </TabsContent>

        <TabsContent value="details" className="space-y-6 mt-6">
          <CustomerDetailsTab
            customer={customer}
            onFormSubmit={handleFormSubmit}
            onPresentationUpload={handlePresentationUpload}
            onPresentationRemove={handleRemovePresentation}
            isLoading={saveLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Button */}
      <div className="flex gap-2 mt-6">
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              Delete Customer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this customer? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
