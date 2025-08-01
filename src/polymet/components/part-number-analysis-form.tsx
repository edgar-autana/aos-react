import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, Loader2, AlertCircle, Edit, Trash2, FileText, FileIcon, Download, ExternalLink, Box } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePartNumber } from '@/hooks/part-number/usePartNumbers';
import { partNumberApi } from '@/services/part-number/partNumberApi';
import { stepConverterApi } from '@/services/step-converter/stepConverterApi';
import { s3Service } from '@/lib/s3';
import { PartNumberPayload } from '@/types/part-number/partNumber';
import { 
  FEASIBILITY_OPTIONS, 
  REASON_FEASIBILITY_OPTIONS, 
  RUNNER_OPTIONS, 
  MOLD_STEEL_CORE_OPTIONS,
  FeasibilityOption,
  ReasonFeasibilityOption,
  RunnerOption,
  MoldSteelCoreOption
} from '@/constants/partNumber';
import ThreeDViewerModal from './3d-viewer-modal';

// Validation schema
const partNumberAnalysisSchema = z.object({
  estimated_anual_units: z.number().min(1, "EAU must be greater than 0"),
  feasibility: z.enum(FEASIBILITY_OPTIONS, {
    required_error: "Please select feasibility",
  }),
  reason_feasibility: z.enum(REASON_FEASIBILITY_OPTIONS).optional(),
  cavities: z.number().min(0, "Cavities must be 0 or greater").optional(),
  mold_life: z.number().min(0, "Mold life must be 0 or greater").optional(),
  runner: z.enum(RUNNER_OPTIONS).optional(),
  mold_steel_core: z.enum(MOLD_STEEL_CORE_OPTIONS).optional(),
}).refine((data) => {
  // If feasibility is "CAN NOT DO", reason_feasibility is required
  if (data.feasibility === "CAN NOT DO") {
    return data.reason_feasibility !== undefined;
  }
  return true;
}, {
  message: "Can't do reason is required when feasibility is 'CAN NOT DO'",
  path: ["reason_feasibility"],
});

type PartNumberAnalysisFormData = z.infer<typeof partNumberAnalysisSchema>;

export default function PartNumberAnalysisForm() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileUploading, setFileUploading] = useState<string | null>(null);
  const [threeDViewerModalOpen, setThreeDViewerModalOpen] = useState(false);
  const [convertingToUrn, setConvertingToUrn] = useState(false);
  
  // Fetch part number data
  const { partNumber, loading, error, refetch } = usePartNumber(id);
  
  const form = useForm<PartNumberAnalysisFormData>({
    resolver: zodResolver(partNumberAnalysisSchema),
    defaultValues: {
      estimated_anual_units: 0,
      feasibility: undefined,
      reason_feasibility: undefined,
      cavities: undefined,
      mold_life: undefined,
      runner: undefined,
      mold_steel_core: undefined,
    },
  });

  const { handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch, reset } = form;

  // Watch feasibility to show/hide reason_feasibility field
  const feasibilityValue = watch("feasibility");

  // Update form when part number data is loaded
  useEffect(() => {
    if (partNumber) {
      reset({
        estimated_anual_units: partNumber.estimated_anual_units || 0,
        feasibility: partNumber.feasibility as FeasibilityOption || undefined,
        reason_feasibility: partNumber.reason_feasibility as ReasonFeasibilityOption || undefined,
        cavities: partNumber.cavities || undefined,
        mold_life: partNumber.mold_life || undefined,
        runner: partNumber.runner as RunnerOption || undefined,
        mold_steel_core: partNumber.mold_steel_core as MoldSteelCoreOption || undefined,
      });
    }
  }, [partNumber, reset]);

  const onSubmit = async (data: PartNumberAnalysisFormData) => {
    if (!partNumber) return;

    // Clear any previous errors
    setFormError(null);
    
    try {
      // Prepare the update payload
      const updatePayload: Partial<PartNumberPayload> = {
        estimated_anual_units: data.estimated_anual_units,
        feasibility: data.feasibility,
        reason_feasibility: data.feasibility === "CAN NOT DO" ? data.reason_feasibility : null,
        cavities: data.cavities || null,
        mold_life: data.mold_life || null,
        runner: data.runner || null,
        mold_steel_core: data.mold_steel_core || null,
      };

      // Debug logging
      console.log('Updating part number analysis:', updatePayload);

      // Save to database
      const response = await partNumberApi.update(partNumber.id, updatePayload);

      if (response.error) {
        console.error('Update error:', response.error);
        throw new Error(response.error);
      }

      toast({
        title: "Analysis Updated",
        description: "Part number analysis has been updated successfully.",
      });

      // Refetch the part number data to get the updated values
      refetch();
      
    } catch (error) {
      console.error('Error updating part number analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update part number analysis';
      setFormError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File, fieldName: 'part_drawing_2d' | 'part_drawing_3d') => {
    if (!partNumber) return;
    
    setFileUploading(fieldName);
    setFormError(null);
    
    console.log(`Starting upload for ${fieldName}:`, file.name);
    
    try {
      const folder = `part-numbers/${partNumber.id}/drawings`;
      console.log('Upload folder:', folder);
      
      const uploadResult = await s3Service.uploadFile({
        file,
        folder,
        contentType: file.type
      });

      console.log('S3 upload result:', uploadResult);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Update the part number with the new file URL
      const updatePayload: Partial<PartNumberPayload> = {
        [fieldName]: uploadResult.url
      };

      console.log('Updating part number with payload:', updatePayload);
      console.log('Part number ID:', partNumber.id);

      const response = await partNumberApi.update(partNumber.id, updatePayload);

      console.log('Database update response:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "File Uploaded",
        description: `${fieldName === 'part_drawing_2d' ? '2D Drawing' : '3D Model'} has been uploaded successfully.`,
      });

      // If it's a 3D file, automatically convert to URN
      if (fieldName === 'part_drawing_3d' && uploadResult.url) {
        console.log('3D file uploaded, automatically converting to URN...');
        // Small delay to ensure the file is available and refetch completes
        setTimeout(() => {
          handleConvertToUrn(false); // Don't show toast for automatic conversion
        }, 1500);
      }

      // Refetch the part number data
      refetch();
      
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to upload ${fieldName === 'part_drawing_2d' ? '2D drawing' : '3D model'}`;
      setFormError(errorMessage);
      
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setFileUploading(null);
    }
  };

  const handleFileDelete = async (fieldName: 'part_drawing_2d' | 'part_drawing_3d') => {
    if (!partNumber) return;
    
    setFormError(null);
    
    try {
      // Update the part number to remove the file URL and URN if it's a 3D file
      const updatePayload: Partial<PartNumberPayload> = {
        [fieldName]: null,
        ...(fieldName === 'part_drawing_3d' && { urn: null }) // Clear URN when 3D file is deleted
      };

      const response = await partNumberApi.update(partNumber.id, updatePayload);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "File Deleted",
        description: `${fieldName === 'part_drawing_2d' ? '2D Drawing' : '3D Model'} has been removed successfully.`,
      });

      // Refetch the part number data
      refetch();
      
    } catch (error) {
      console.error(`Error deleting ${fieldName}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${fieldName === 'part_drawing_2d' ? '2D drawing' : '3D model'}`;
      setFormError(errorMessage);
      
      toast({
        title: "Delete Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePartNumberDelete = async () => {
    if (!partNumber) return;
    
    try {
      const response = await partNumberApi.delete(partNumber.id);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Part Number Deleted",
        description: "Part number has been deleted successfully.",
      });

      // Navigate back to the previous page
      navigate(-1);
      
    } catch (error) {
      console.error('Error deleting part number:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete part number';
      setFormError(errorMessage);
      
      toast({
        title: "Delete Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleConvertToUrn = async (showToast = true) => {
    if (!partNumber?.part_drawing_3d) {
      if (showToast) {
        toast({
          title: "No 3D Model",
          description: "Please upload a 3D model (STEP file) first.",
          variant: "destructive",
        });
      }
      return;
    }

    setConvertingToUrn(true);
    setFormError(null);

    try {
      console.log('Converting STEP file to URN:', partNumber.part_drawing_3d);
      
      const conversionResult = await stepConverterApi.convertStepToUrn(partNumber.part_drawing_3d);

      if (!conversionResult.success || !conversionResult.urn) {
        throw new Error(conversionResult.error || 'Failed to convert STEP to URN');
      }

      // Update the part number with the URN
      const updatePayload: Partial<PartNumberPayload> = {
        urn: conversionResult.urn
      };

      const response = await partNumberApi.update(partNumber.id, updatePayload);

      if (response.error) {
        throw new Error(response.error);
      }

      if (showToast) {
        toast({
          title: "Conversion Successful",
          description: "STEP file has been converted to URN for 3D viewing.",
        });
      }

      // Refetch the part number data
      refetch();
      
    } catch (error) {
      console.error('Error converting STEP to URN:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert STEP to URN';
      setFormError(errorMessage);
      
      if (showToast) {
        toast({
          title: "Conversion Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setConvertingToUrn(false);
    }
  };

  const handleOpen3DViewer = () => {
    if (!partNumber?.part_drawing_3d) {
      toast({
        title: "No 3D Model",
        description: "Please upload a 3D model (STEP file) first.",
        variant: "destructive",
      });
      return;
    }

    // Always open the modal first
    setThreeDViewerModalOpen(true);
    
    // If no URN exists, convert in background
    if (!partNumber.urn) {
      handleConvertToUrn(false); // Don't show toast since modal will show the result
    }
  };

  const getFileNameFromUrl = (url: string | null): string => {
    if (!url) return '';
    const parts = url.split('/');
    const filename = parts[parts.length - 1] || 'Unknown file';
    
    // Return the complete filename (UUID_filename)
    return filename;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading part number details...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !partNumber) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Failed to load part number details"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Part Drawing Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* 2D Drawing File */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">2D Drawing (PDF)</Label>
            <div className="flex items-center gap-2">
              {partNumber.part_drawing_2d ? (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 flex-1">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm truncate">{getFileNameFromUrl(partNumber.part_drawing_2d)}</span>
                  <div className="flex gap-1 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(partNumber.part_drawing_2d!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = partNumber.part_drawing_2d!;
                              link.download = getFileNameFromUrl(partNumber.part_drawing_2d);
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete 2D Drawing</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this 2D drawing file? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleFileDelete('part_drawing_2d')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 border-2 border-dashed rounded-md border-muted-foreground/25 flex-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No 2D drawing uploaded</span>
                </div>
              )}
              <input
                type="file"
                id="2d-drawing-upload"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('File selected for 2D upload:', file.name, file.size);
                    handleFileUpload(file, 'part_drawing_2d');
                  }
                }}
                disabled={fileUploading === 'part_drawing_2d'}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('2D upload button clicked');
                        document.getElementById('2d-drawing-upload')?.click();
                      }}
                      disabled={fileUploading === 'part_drawing_2d'}
                    >
                      {fileUploading === 'part_drawing_2d' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : partNumber.part_drawing_2d ? (
                        <Edit className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{partNumber.part_drawing_2d ? 'Replace 2D drawing' : 'Upload 2D drawing'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* 3D Model File */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">3D Model (STEP/STP)</Label>
            <div className="flex items-center gap-2">
              {partNumber.part_drawing_3d ? (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 flex-1">
                  <FileIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm truncate">{getFileNameFromUrl(partNumber.part_drawing_3d)}</span>
                  <div className="flex gap-1 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleOpen3DViewer}
                            disabled={convertingToUrn}
                          >
                            {convertingToUrn ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Box className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{partNumber.urn ? 'View 3D Model' : 'Convert & View 3D Model'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(partNumber.part_drawing_3d!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = partNumber.part_drawing_3d!;
                              link.download = getFileNameFromUrl(partNumber.part_drawing_3d);
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete 3D Model</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this 3D model file? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleFileDelete('part_drawing_3d')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 border-2 border-dashed rounded-md border-muted-foreground/25 flex-1">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No 3D model uploaded</span>
                </div>
              )}
              <input
                type="file"
                id="3d-model-upload"
                accept=".step,.stp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('File selected for 3D upload:', file.name, file.size);
                    handleFileUpload(file, 'part_drawing_3d');
                  }
                }}
                disabled={fileUploading === 'part_drawing_3d'}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('3D upload button clicked');
                        document.getElementById('3d-model-upload')?.click();
                      }}
                      disabled={fileUploading === 'part_drawing_3d'}
                    >
                      {fileUploading === 'part_drawing_3d' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : partNumber.part_drawing_3d ? (
                        <Edit className="h-4 w-4" />
                      ) : (
                        <FileIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{partNumber.part_drawing_3d ? 'Replace 3D model' : 'Upload 3D model'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Part Number Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EAU */}
                <FormField
                  control={control}
                  name="estimated_anual_units"
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

                {/* Feasibility */}
                <FormField
                  control={control}
                  name="feasibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feasibility *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger {...{} as any}>
                            <SelectValue placeholder="Select feasibility" />
                          </SelectTrigger>
                          <SelectContent {...{} as any}>
                            {FEASIBILITY_OPTIONS.map((option) => (
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

                {/* Can't do reason - conditional */}
                {feasibilityValue === "CAN NOT DO" && (
                  <FormField
                    control={control}
                    name="reason_feasibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Can't Do Reason *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger {...{} as any}>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent {...{} as any}>
                              {REASON_FEASIBILITY_OPTIONS.map((option) => (
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
                )}

                {/* Cavities */}
                <FormField
                  control={control}
                  name="cavities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cavities</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter number of cavities" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mold Life */}
                <FormField
                  control={control}
                  name="mold_life"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mold Life</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter mold life" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Runner */}
                <FormField
                  control={control}
                  name="runner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Runner</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger {...{} as any}>
                            <SelectValue placeholder="Select runner" />
                          </SelectTrigger>
                          <SelectContent {...{} as any}>
                            {RUNNER_OPTIONS.map((option) => (
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

                {/* Steel Core */}
                <FormField
                  control={control}
                  name="mold_steel_core"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Steel Core</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger {...{} as any}>
                            <SelectValue placeholder="Select steel core" />
                          </SelectTrigger>
                          <SelectContent {...{} as any}>
                            {MOLD_STEEL_CORE_OPTIONS.map((option) => (
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
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Part Number
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Part Number</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this part number? This action cannot be undone and will remove all associated data including files and analysis.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handlePartNumberDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Analysis
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

              <ThreeDViewerModal
          isOpen={threeDViewerModalOpen}
          onClose={() => {
            setThreeDViewerModalOpen(false);
            setFormError(null); // Clear error when closing modal
          }}
          urn={partNumber?.urn || null}
          isLoading={convertingToUrn}
          conversionError={formError}
        />
    </div>
  );
} 