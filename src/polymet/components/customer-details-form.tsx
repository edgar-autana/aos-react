import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileIcon, FileTextIcon, PresentationIcon, LoaderIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Company, supabase } from "@/lib/supabase";
import FileUploadZone from "./file-upload-zone";

// Status options for customer
const STATUS_OPTIONS = [
  "Prospect",
  "In progress", 
  "Paying Customer",
  "Repeat Customer",
  "Cold"
] as const;

// Validation schema
const customerFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.enum(STATUS_OPTIONS).default("Prospect"),
  enabled: z.boolean().default(true),
  slug: z.string().min(1, "Slug is required"),
  address: z.string().optional(),
  nda_signed: z.date().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerDetailsFormProps {
  company: Company;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  onPresentationUpload?: (file: File) => void;
  onPresentationRemove?: () => void;
}

// Check if slug exists in database, excluding current company
const checkSlugExists = async (slug: string, excludeId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('tb_company')
      .select('id')
      .eq('slug', slug)
      .neq('id', excludeId);
    
    if (error) {
      console.error('Error checking slug existence:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Exception checking slug existence:', error);
    return false;
  }
};

export default function CustomerDetailsForm({ 
  company, 
  onSubmit, 
  isLoading = false,
  onPresentationUpload,
  onPresentationRemove 
}: CustomerDetailsFormProps) {
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [uploadingPresentation, setUploadingPresentation] = useState(false);
  const [showUploadComponent, setShowUploadComponent] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: company.name || "",
      description: company.description || "",
      url: company.url || "",
      phone: company.phone || "",
      status: STATUS_OPTIONS.includes(company.status as any) ? (company.status as any) : "Prospect",
      enabled: company.enabled ?? true,
      slug: company.slug || "",
      address: company.address || "",
      nda_signed: company.nda_signed ? new Date(company.nda_signed) : undefined,
    },
  });

  const handleSubmit = async (data: CustomerFormData) => {
    setIsValidatingSlug(true);
    setError(null);

    try {
      // Check if slug already exists (excluding current company)
      const slugExists = await checkSlugExists(data.slug, company.id);
      
      if (slugExists) {
        setError("This slug already exists. Please change it manually to a unique value.");
        setIsValidatingSlug(false);
        return;
      }

      // Slug is valid, proceed with form submission
      onSubmit(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to validate slug";
      setError(errorMessage);
      console.error('Exception during slug validation:', err);
    } finally {
      setIsValidatingSlug(false);
    }
  };

  const handlePresentationFileChange = async (file: File | null) => {
    setPresentationFile(file);
    
    if (file && onPresentationUpload) {
      setUploadingPresentation(true);
      try {
        await onPresentationUpload(file);
        // File uploaded successfully, clear the local file state and hide upload component
        setPresentationFile(null);
        setShowUploadComponent(false);
      } catch (error) {
        console.error('Presentation upload failed:', error);
        // Keep the file in state on error so user can retry
      } finally {
        setUploadingPresentation(false);
      }
    } else if (!file) {
      // If file is removed/cancelled, hide the upload component if there's a current presentation
      if (company.presentation) {
        setShowUploadComponent(false);
      }
    }
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileTextIcon className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileIcon className="h-6 w-6 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <PresentationIcon className="h-6 w-6 text-orange-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleRemoveCurrentPresentation = async () => {
    if (onPresentationRemove) {
      setUploadingPresentation(true);
      setRemoveDialogOpen(false);
      try {
        await onPresentationRemove();
        setShowUploadComponent(false);
      } catch (error) {
        console.error('Presentation removal failed:', error);
      } finally {
        setUploadingPresentation(false);
      }
    }
  };

  // Get current presentation file info
  const getCurrentPresentationInfo = () => {
    if (!company.presentation) return null;
    
    const url = company.presentation;
    const fileName = url.split('/').pop() || 'presentation';
    const extension = fileName.split('.').pop()?.toLowerCase() || 'unknown';
    
    return {
      fileName,
      extension,
      url,
      icon: getFileIcon(new File([], fileName))
    };
  };

  const currentPresentation = getCurrentPresentationInfo();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Company Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="company-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL-friendly version of the company name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger {...{} as any}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent {...{} as any}>
                        <SelectItem value="Prospect" {...{} as any}>Prospect</SelectItem>
                        <SelectItem value="In progress" {...{} as any}>In progress</SelectItem>
                        <SelectItem value="Paying Customer" {...{} as any}>Paying Customer</SelectItem>
                        <SelectItem value="Repeat Customer" {...{} as any}>Repeat Customer</SelectItem>
                        <SelectItem value="Cold" {...{} as any}>Cold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enabled */}
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Status
                      </FormLabel>
                      <FormDescription>
                        Enable or disable this customer
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* URL */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NDA Signed Date */}
              <FormField
                control={form.control}
                name="nda_signed"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>NDA Signed Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Date when NDA was signed (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter company description..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter company address..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Company Presentation</Label>
              
              {/* Current Presentation Display */}
              {currentPresentation && !presentationFile && !uploadingPresentation && (
                <div className="border-2 border-dashed border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {currentPresentation.icon}
                      <div>
                        <p className="font-medium text-sm">{currentPresentation.fileName}</p>
                        <p className="text-xs text-muted-foreground">{currentPresentation.extension.toUpperCase()} Document</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(currentPresentation.url, '_blank')}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Preview
                      </Button>
                                             <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                         <AlertDialogTrigger asChild>
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             className="text-destructive hover:text-destructive"
                           >
                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                             Remove
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Remove Presentation</AlertDialogTitle>
                             <AlertDialogDescription>
                               Are you sure you want to remove this presentation? This action cannot be undone and the file will be permanently deleted from cloud storage.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction 
                               onClick={handleRemoveCurrentPresentation}
                               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                             >
                               Remove Presentation
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-2">✓ Presentation uploaded - you can preview, remove, or upload a new one to replace it</p>
                </div>
              )}

              {/* Upload Component */}
              {(!currentPresentation || presentationFile || uploadingPresentation || showUploadComponent) && (
                <FileUploadZone
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  label={
                    uploadingPresentation 
                      ? "Uploading presentation..." 
                      : presentationFile 
                        ? currentPresentation ? "Replace presentation" : "Upload presentation"
                        : currentPresentation ? "Upload new presentation" : "Upload company presentation"
                  }
                  icon={
                    uploadingPresentation 
                      ? <LoaderIcon className="h-6 w-6 text-blue-500 animate-spin" />
                      : getFileIcon(presentationFile || new File([], "temp.pdf"))
                  }
                  onFileChange={handlePresentationFileChange}
                  file={presentationFile}
                  disabled={uploadingPresentation}
                />
              )}

              {/* Show upload button when there's a current presentation but no active upload */}
              {currentPresentation && !presentationFile && !uploadingPresentation && !showUploadComponent && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowUploadComponent(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload New Presentation
                </Button>
              )}
              
              <p className="text-sm text-muted-foreground">
                Accepted formats: PDF, DOC, DOCX, PPT, PPTX
                {uploadingPresentation && (
                  <span className="block text-blue-600 mt-1">
                    ⏳ Uploading presentation to cloud storage...
                  </span>
                )}
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
             
              <Button type="submit" disabled={isLoading || isValidatingSlug}>
                {isValidatingSlug ? "Validating..." : isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 