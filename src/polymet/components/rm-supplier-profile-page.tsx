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
  PackageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRMSuppliers } from "@/hooks/rm-supplier/useRMSuppliers";
import { RMSupplier } from "@/types/rm-supplier/rmSupplier";
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
import { rmSupplierApi } from "@/services/rm-supplier/rmSupplierApi";
import RMSupplierDetailsForm from "./rm-supplier-details-form";
import { s3Service, validateImageFile } from "@/lib/s3";
import { useToast } from "@/hooks/use-toast";

export default function RMSupplierProfilePage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { suppliers, updateSupplier, deleteSupplier, loading } = useRMSuppliers();
  const [supplier, setSupplier] = useState<RMSupplier | null>(null);
  const [form, setForm] = useState<Partial<RMSupplier>>({});
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
        const response = await rmSupplierApi.getById(supplierId);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setSupplier(response.data);
          setForm(response.data);
        } else {
          setError("RM Supplier not found");
        }
      } catch (err) {
        setError("Failed to load RM supplier data");
      } finally {
        setPageLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId]);

  const handleFormSubmit = async (formData: any) => {
    if (!supplierId) return;
    
    setSaveLoading(true);
    setError(null);
    
    try {
      const response = await updateSupplier(supplierId, formData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Show success toast regardless of whether data is returned
      toast({
        title: "Success",
        description: "RM Supplier updated successfully.",
      });
      
      if (response.data) {
        setSupplier(response.data);
        setForm(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update RM supplier";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!supplierId) return;
    
    try {
      const response = await deleteSupplier(supplierId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: "Success",
        description: "RM Supplier deleted successfully.",
      });
      
      navigate("/rm-suppliers");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete RM supplier";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
      // Upload image to S3
      const uploadResult = await s3Service.uploadRMSupplierImage(file, supplierId);
      
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload image');
        return;
      }
      
      // Update supplier with new image URL
      const response = await updateSupplier(supplierId, { image: uploadResult.url });
      
      if (response.error) {
        setError(response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }
      
      // Show success toast regardless of whether data is returned
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
      
      if (response.data) {
        setSupplier(response.data);
        setForm(response.data);
      }
    } catch (err) {
      const errorMessage = 'Failed to upload image';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (pageLoading) {
    return <PageLoading text="Loading RM supplier data..." />;
  }

  // Error state
  if (error || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">RM Supplier Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The RM supplier you're looking for doesn't exist or has been removed."}
        </p>
        <Link to="/rm-suppliers">
          <Button variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to RM Suppliers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/rm-suppliers">
        <Button variant="ghost" className="pl-0 mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to RM Suppliers
        </Button>
      </Link>

      {/* RM Supplier header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative group">
          <Avatar className="h-20 w-20 border cursor-pointer transition-all duration-200 group-hover:opacity-80">
          {form.image ? (
              <AvatarImage src={form.image} alt={form.name || 'RM Supplier'} />
          ) : (
            <AvatarFallback className="text-xl">
                <PackageIcon className="h-8 w-8 text-muted-foreground" />
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
            {form.material_types && form.material_types.length > 0 && (
              <span>• {form.material_types.join(', ')}</span>
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
            {form.certifications && form.certifications.length > 0 && (
              form.certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {cert}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RM Supplier details */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Raw Material Supplier Detail</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <RMSupplierDetailsForm
            supplier={supplier}
            onSubmit={handleFormSubmit}
            isLoading={saveLoading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>RM Supplier Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.material_types && supplier.material_types.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Material Types</label>
                    <p className="text-sm text-muted-foreground">{supplier.material_types.join(', ')}</p>
                  </div>
                )}
                {supplier.full_address && (
                  <div>
                    <label className="text-sm font-medium">Full Address</label>
                    <p className="text-sm text-muted-foreground">{supplier.full_address}</p>
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
                {supplier.certifications && supplier.certifications.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Certifications</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {supplier.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {supplier.created_at && (
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(supplier.created_at)}
                    </p>
                  </div>
                )}
                {supplier.updated_at && (
                  <div>
                    <label className="text-sm font-medium">Last Updated</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(supplier.updated_at)}
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
              Delete RM Supplier
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete RM Supplier</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this RM supplier? This action cannot be undone.
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