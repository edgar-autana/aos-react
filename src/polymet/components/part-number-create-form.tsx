import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save, Loader2, Upload, FileText, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { partNumberApi } from '@/services/part-number/partNumberApi';
import { PartNumberPayload } from '@/types/part-number/partNumber';
import { s3Service } from '@/lib/s3';
import { rfqApi } from '@/services/rfq/rfqApi';

interface PartNumberCreateFormProps {
  rfqId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CORE_OPTIONS = ["CNC", "Machining", "HPDC", "IM"] as const;

// Validation schema
const partNumberCreateSchema = z.object({
  drawing_number: z.string().min(1, "Part number is required"),
  part_name: z.string().min(1, "Part name is required"),
  description: z.string().optional(),
  main_process: z.enum(CORE_OPTIONS, {
    required_error: "Please select a core process",
  }),
  estimated_annual_units: z.number().min(1, "EAU must be greater than 0"),
  part_drawing_2d: z.instanceof(File, {
    message: "2D drawing (PDF) is required",
  }).refine(
    (file) => file.type === "application/pdf",
    "2D drawing must be a PDF file"
  ),
  part_drawing_3d: z.instanceof(File, {
    message: "3D drawing (.step/.stp) is required",
  }).refine(
    (file) => {
      const validExtensions = ['.step', '.stp'];
      return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    },
    "3D drawing must be a .step or .stp file"
  ),
});

type PartNumberCreateFormData = z.infer<typeof partNumberCreateSchema>;

export default function PartNumberCreateForm({ 
  rfqId, 
  onSuccess, 
  onCancel 
}: PartNumberCreateFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loadingRfq, setLoadingRfq] = useState(true);
  
  const form = useForm<PartNumberCreateFormData>({
    resolver: zodResolver(partNumberCreateSchema),
    defaultValues: {
      drawing_number: '',
      part_name: '',
      description: '',
      main_process: undefined,
      estimated_annual_units: 0,
      part_drawing_2d: undefined,
      part_drawing_3d: undefined,
    },
  });

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch, clearErrors } = form;

  // Fetch RFQ data to get company ID
  useEffect(() => {
    const fetchRfqData = async () => {
      try {
        setLoadingRfq(true);
        const response = await rfqApi.getById(rfqId);
        
        if (response.error || !response.data) {
          console.error('Error fetching RFQ:', response.error);
          setFormError('Failed to load RFQ information');
          return;
        }

        // Get company ID from RFQ (prefer 'company')
        const rfqCompanyId = response.data?.company;
        
        if (!rfqCompanyId) {
          console.error('No company ID found in RFQ');
          setFormError('RFQ is not associated with a company');
          return;
        }

        setCompanyId(rfqCompanyId);
        console.log('Found company ID for RFQ:', rfqCompanyId);
        
      } catch (error) {
        console.error('Exception fetching RFQ:', error);
        setFormError('Failed to load RFQ information');
      } finally {
        setLoadingRfq(false);
      }
    };

    if (rfqId) {
      fetchRfqData();
    }
  }, [rfqId]);

  const handleFileUpload = async (file: File, fieldName: string): Promise<string> => {
    const folder = `part-numbers/${rfqId}`;
    
    setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));
    
    try {
      const uploadResult = await s3Service.uploadFile({
        file,
        folder,
        contentType: file.type
      });

      setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      return uploadResult.url;
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      throw error;
    }
  };

  const onSubmit = async (data: PartNumberCreateFormData) => {
    // Check if company ID is available
    if (!companyId) {
      setFormError('Company information not available. Please try again.');
      return;
    }

    setIsUploading(true);
    setFormError(null); // Clear any previous errors
    
    try {
      // Upload files to S3
      setUploadProgress({ part_drawing_2d: 0, part_drawing_3d: 0 });
      
      const [drawing2dUrl, drawing3dUrl] = await Promise.all([
        handleFileUpload(data.part_drawing_2d, 'part_drawing_2d'),
        handleFileUpload(data.part_drawing_3d, 'part_drawing_3d')
      ]);

      // Prepare the part number payload
      const partNumberPayload: PartNumberPayload = {
        rfq: rfqId,
        company: companyId, // Include the company ID from RFQ
        drawing_number: data.drawing_number,
        part_name: data.part_name,
        description: data.description || null,
        main_process: data.main_process,
        estimated_anual_units: data.estimated_annual_units,
        part_drawing_2d: drawing2dUrl,
        part_drawing_3d: drawing3dUrl,
        enabled: true,
      };

      // Debug logging
      console.log('Sending part number payload:', partNumberPayload);
      console.log('Company ID from RFQ:', companyId);

      // Save to database
      const response = await partNumberApi.create(partNumberPayload);

      if (response.error) {
        console.error('Database error:', response.error);
        throw new Error(response.error);
      }

      toast({
        title: "Part Number Created",
        description: `Part number "${data.part_name}" has been created successfully.`,
      });

      onSuccess?.();
      
    } catch (error) {
      console.error('Error creating part number:', error);
      
      // Enhanced error handling with detailed information
      let errorMessage = "Failed to create part number";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific database errors
        if (error.message.includes('uuid')) {
          errorMessage = "Database configuration error: Invalid UUID format. Please contact support.";
        } else if (error.message.includes('PGRST')) {
          errorMessage = `Database error: ${error.message}`;
        } else if (error.message.includes('400')) {
          errorMessage = `Bad request: ${error.message}`;
        }
      }
      
      // Set form error for display
      setFormError(errorMessage);
      
      toast({
        title: "Error Creating Part Number",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'part_drawing_2d' | 'part_drawing_3d') => {
    const file = event.target.files?.[0];
    if (file) {
      setValue(fieldName, file);
      // Clear validation error for this field when file is selected
      clearErrors(fieldName);
    }
  };

  const watchedFiles = watch(['part_drawing_2d', 'part_drawing_3d']);

  // Show loading state while fetching RFQ data
  if (loadingRfq) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading RFQ information...</span>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Display */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Creating Part Number</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{formError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Part Number */}
              <FormField
                control={control}
                name="drawing_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter part number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Part Name */}
              <FormField
                control={control}
                name="part_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter part name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Core Process */}
              <FormField
                control={control}
                name="main_process"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Core *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger {...{} as any}>
                          <SelectValue placeholder="Select core process" />
                        </SelectTrigger>
                        <SelectContent {...{} as any}>
                          {CORE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} {...{} as any}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EAU */}
              <FormField
                control={control}
                name="estimated_annual_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EAU (Estimated Annual Units) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter estimated annual units" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sales Context */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Context</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter sales context (optional)"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Technical Drawings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 2D Drawing */}
              <FormField
                control={control}
                name="part_drawing_2d"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2D Drawing (PDF) *</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, 'part_drawing_2d')}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 h-11"
                        />
                        {watchedFiles[0] && (
                          <div className="text-sm text-muted-foreground">
                            Selected: {watchedFiles[0].name}
                          </div>
                        )}
                        {uploadProgress.part_drawing_2d !== undefined && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress.part_drawing_2d}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a PDF file containing the 2D technical drawing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 3D Drawing */}
              <FormField
                control={control}
                name="part_drawing_3d"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3D Drawing (.step/.stp) *</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept=".step,.stp"
                          onChange={(e) => handleFileChange(e, 'part_drawing_3d')}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 h-11"
                        />
                        {watchedFiles[1] && (
                          <div className="text-sm text-muted-foreground">
                            Selected: {watchedFiles[1].name}
                          </div>
                        )}
                        {uploadProgress.part_drawing_3d !== undefined && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress.part_drawing_3d}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a .step or .stp file containing the 3D CAD model
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="min-w-[120px]"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Part Number
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 