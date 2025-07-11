import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  CheckIcon,
  CircleIcon,
  MinusIcon,
  Building2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuppliers } from "@/hooks/supplier/useSuppliers";
import { Supplier } from "@/types/supplier/supplier";
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
import { Link } from "react-router-dom";
import { PageLoading } from "@/components/ui/loading";
import { formatDate } from "@/utils/dateUtils";
import { supplierApi } from "@/services/supplier/supplierApi";
import SupplierDetailsForm from "./supplier-details-form";
import { s3Service, validateImageFile } from "@/lib/s3";

export default function SupplierProfilePage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { getSupplierById, updateSupplier, deleteSupplier, loading } = useSuppliers();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId) return;
      
      setPageLoading(true);
      setError(null);
      
      try {
        const supplierData = await getSupplierById(supplierId);
        
        if (supplierData) {
          setSupplier(supplierData);
          setForm(supplierData);
        } else {
          setError("Supplier not found");
        }
      } catch (err) {
        setError("Failed to load supplier data");
      } finally {
        setPageLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId, getSupplierById]);

  const handleFormSubmit = async (formData: any) => {
    if (!supplierId) return;
    
    setSaveLoading(true);
    setError(null);
    
    try {
      // Prepare data for Supabase tb_supplier table
      const apiData = {
        name: formData.name,
        comercial_name: formData.comercial_name || null,
        description: formData.description || null,
        link_web: formData.link_web || null,
        phone: formData.phone || null,
        full_address: formData.full_address || null,
        zip: formData.zip || null,
        state: formData.state || null,
        type: formData.type || null,
        size: formData.size || null,
        capacity: formData.type || null, // Save supplier type to capacity field
        enabled: formData.enabled,
        iso_9001_2015: formData.iso_9001_2015,
        iatf: formData.iatf,
        first_contact: formData.first_contact ? formData.first_contact.toISOString() : null,
      };
      
      const response = await supplierApi.update(supplierId, apiData);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setSupplier(response.data);
        setForm(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update supplier";
      setError(errorMessage);
      console.error('Exception during supplier update:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!supplierId) return;
    
    try {
      const response = await supplierApi.delete(supplierId);
      
      if (response.error) {
        setError(response.error);
      } else {
        navigate('/suppliers');
      }
    } catch (err) {
      setError("Failed to delete supplier");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !supplierId) return;
    
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
      // Upload image to S3 using supplier-specific folder structure
      const uploadResult = await s3Service.uploadSupplierImage(file, supplierId);
      
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload image');
        return;
      }
      
      // Update supplier image URL in database
      const updateData = { image: uploadResult.url };
      const response = await supplierApi.update(supplierId, updateData);
      
      if (response.error) {
        setError(response.error);
        // If database update fails, clean up uploaded file
        if (uploadResult.key) {
          await s3Service.deleteFile(uploadResult.key);
        }
      } else if (response.data) {
        // Update local state with new image URL
        setSupplier(response.data);
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

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Loading state
  if (pageLoading) {
    return <PageLoading text="Loading supplier data..." />;
  }

  // Error state
  if (error || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Supplier Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The supplier you're looking for doesn't exist or has been removed."}
        </p>
        <Link to="/suppliers">
          <Button variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/suppliers">
        <Button variant="ghost" className="pl-0 mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
      </Link>

      {/* Supplier header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative group">
          <Avatar className="h-20 w-20 border cursor-pointer transition-all duration-200 group-hover:opacity-80">
          {form.image ? (
              <AvatarImage src={form.image} alt={form.name || 'Supplier'} />
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
            <h1 className="text-2xl font-bold">{form.name}</h1>
            <Badge
              variant={form.enabled ? "default" : "secondary"}
              className={
                form.enabled
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400"
              }
            >
              {form.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {form.comercial_name && (
              <span>{form.comercial_name}</span>
            )}
            {form.type && (
              <span>• {form.type}</span>
            )}
            {form.size && (
              <span>• {form.size}</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {form.phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4" />
                {form.phone}
              </div>
            )}
            {form.full_address && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                {form.full_address}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {form.iso_9001_2015 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                ISO 9001:2015
              </Badge>
            )}
            {form.iatf && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                IATF
              </Badge>
            )}
          </div>
        </div>


      </div>

      {/* Supplier details */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Supplier Detail</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <SupplierDetailsForm
            supplier={supplier}
            onSubmit={handleFormSubmit}
            isLoading={saveLoading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.type && (
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <p className="text-sm text-muted-foreground">{supplier.type}</p>
                  </div>
                )}
                {supplier.size && (
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <p className="text-sm text-muted-foreground">{supplier.size}</p>
                  </div>
                )}
                {supplier.capacity && (
                  <div>
                    <label className="text-sm font-medium">Capacity</label>
                    <p className="text-sm text-muted-foreground">{supplier.capacity}</p>
                  </div>
                )}
                {supplier.presentation && (
                  <div>
                    <label className="text-sm font-medium">Presentation</label>
                    <p className="text-sm text-muted-foreground">{supplier.presentation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground">
                    {supplier.enabled ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">ISO 9001:2015</label>
                  <p className="text-sm text-muted-foreground">
                    {supplier.iso_9001_2015 ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">IATF</label>
                  <p className="text-sm text-muted-foreground">
                    {supplier.iatf ? "Yes" : "No"}
                  </p>
                </div>
                {supplier.first_contact && (
                  <div>
                    <label className="text-sm font-medium">First Contact</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(supplier.first_contact)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Button */}
      <div className="flex gap-2 mt-6">
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              Delete Supplier
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this supplier? This action cannot be undone.
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
