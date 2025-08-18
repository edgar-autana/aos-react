import React, { useState, useEffect, useRef } from 'react';
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
import PDFViewerModal from './pdf-viewer/pdf-viewer-modal';

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

interface PartNumberAnalysisFormProps {
  onDataUpdate?: () => void;
}

export default function PartNumberAnalysisForm({ onDataUpdate }: PartNumberAnalysisFormProps = {}) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileUploading, setFileUploading] = useState<string | null>(null);
  const [threeDViewerModalOpen, setThreeDViewerModalOpen] = useState(false);
  const [convertingToUrn, setConvertingToUrn] = useState(false);
  const [conversionJustCompleted, setConversionJustCompleted] = useState(false);
  const modalShouldStayOpen = useRef(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');
  
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

  // Keep modal open if it should stay open during conversion
  useEffect(() => {
    if (modalShouldStayOpen.current && !threeDViewerModalOpen) {
      // Use a small delay to prevent rapid open/close cycles
      const timer = setTimeout(() => {
        setThreeDViewerModalOpen(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [threeDViewerModalOpen]);

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
      
      // Notify parent component about the update
      onDataUpdate?.();
      
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
    
    
    try {
      const folder = `part-numbers/${partNumber.id}/drawings`;
      
      const uploadResult = await s3Service.uploadFile({
        file,
        folder,
        contentType: file.type
      });


      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Update the part number with the new file URL
      const updatePayload: Partial<PartNumberPayload> = {
        [fieldName]: uploadResult.url
      };


      const response = await partNumberApi.update(partNumber.id, updatePayload);


      if (response.error) {
        throw new Error(response.error);
      }

      // If it's a 2D PDF, automatically create a new conversation
      if (fieldName === 'part_drawing_2d' && uploadResult.url) {
        try {
          const { conversationService } = await import('@/polymet/services/conversation-service');
          const conversationResponse = await conversationService.createConversation({
            part_number_id: partNumber.id,
            document_url: uploadResult.url,
            title: `Analysis - ${partNumber.part_name || partNumber.drawing_number || `Part ${partNumber.id}`}`,
            initial_message: "", // Empty message so no initial message appears in chat
            is_active_document: true
          });
          
          if (conversationResponse.success) {
          } else {
            console.warn('Failed to create conversation');
          }
        } catch (conversationError) {
          console.error('Error creating conversation:', conversationError);
          // Don't throw error here, as the file upload was successful
        }
      }

      toast({
        title: "File Uploaded",
        description: `${fieldName === 'part_drawing_2d' ? '2D Drawing' : '3D Model'} has been uploaded successfully.`,
      });

      // If it's a 3D file, automatically convert to URN
      if (fieldName === 'part_drawing_3d' && uploadResult.url) {
        
        // Wait for database update to complete and add delay for S3 consistency
        setTimeout(async () => {
          // Verify the file is accessible before conversion
          if (uploadResult.url) {
            try {
              const headResponse = await fetch(uploadResult.url, { method: 'HEAD' });
              if (headResponse.ok) {
                // Use the newly uploaded URL directly instead of relying on database state
                handleConvertToUrnWithUrl(uploadResult.url, false);
              } else {
                console.warn('File not yet accessible, retrying in 2 seconds...');
                setTimeout(() => {
                  if (uploadResult.url) {
                    handleConvertToUrnWithUrl(uploadResult.url, false);
                  }
                }, 2000);
              }
            } catch (error) {
              console.warn('Error verifying file accessibility:', error);
              // Proceed anyway after additional delay
              setTimeout(() => {
                if (uploadResult.url) {
                  handleConvertToUrnWithUrl(uploadResult.url, false);
                }
              }, 3000);
            }
          } else {
            console.warn('No upload URL available, proceeding with conversion anyway');
            handleConvertToUrn(false);
          }
        }, 2000); // Increased delay to ensure S3 consistency
      }

      // Refetch the part number data
      refetch();
      
      // Notify parent component about the update
      onDataUpdate?.();
      
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
      
      // Notify parent component about the update
      onDataUpdate?.();
      
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

  const handleConvertToUrnWithUrl = async (fileUrl: string, showToast = true) => {
    if (!partNumber) return;
    
    setConvertingToUrn(true);
    setFormError(null);

    try {
      // Validate URL before processing
      let url: URL;
      try {
        url = new URL(fileUrl);
      } catch (urlError) {
        throw new Error('Invalid file URL provided');
      }
      
      const conversionResult = await stepConverterApi.convertStepToUrn(fileUrl);

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

      // Mark that conversion just completed to prevent modal from closing
      setConversionJustCompleted(true);
      modalShouldStayOpen.current = true;
      
      // Refetch the part number data to get the new URN
      await refetch();
      
      // Delay parent notification to prevent immediate re-render
      setTimeout(() => {
        onDataUpdate?.();
      }, 300);
      
      // Clear the flags after modal has had time to show the 3D viewer
      setTimeout(() => {
        setConversionJustCompleted(false);
        modalShouldStayOpen.current = false;
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error converting STEP to URN:', error);
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

    // Use the specific URL version
    return handleConvertToUrnWithUrl(partNumber.part_drawing_3d, showToast);
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
    
    // If no URN exists, convert in background and keep modal open
    if (!partNumber.urn) {
      modalShouldStayOpen.current = true;
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
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              2D Drawing (PDF)
            </Label>
            <div className="flex items-center gap-2">
              {partNumber.part_drawing_2d ? (
                <div className="flex items-center gap-3 p-6 border-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 flex-1 hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 truncate">{getFileNameFromUrl(partNumber.part_drawing_2d)}</p>
                    <p className="text-xs text-blue-600">PDF Document • Ready for analysis</p>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-blue-50 border-blue-200"
                            onClick={() => {
                              setSelectedPdfUrl(partNumber.part_drawing_2d!);
                              setSelectedPdfTitle(`${partNumber.part_name || 'Part'} - 2D Drawing`);
                              setPdfViewerOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View PDF</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-blue-50 border-blue-200"
                            onClick={async () => {
                              try {
                                const response = await fetch(partNumber.part_drawing_2d!);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = getFileNameFromUrl(partNumber.part_drawing_2d);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Error downloading file:', error);
                                // Fallback to simple download
                                const link = document.createElement('a');
                                link.href = partNumber.part_drawing_2d!;
                                link.download = getFileNameFromUrl(partNumber.part_drawing_2d);
                                link.target = '_blank';
                                link.click();
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download PDF</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-white hover:bg-red-50 border-red-200">
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
                <div className="flex items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 flex-1 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-1">No 2D drawing uploaded</p>
                    <p className="text-sm text-gray-500">Upload a PDF file to enable AI analysis</p>
                  </div>
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
                    handleFileUpload(file, 'part_drawing_2d');
                  }
                }}
                disabled={fileUploading === 'part_drawing_2d'}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={partNumber.part_drawing_2d ? "outline" : "default"}
                      size="lg"
                      className={partNumber.part_drawing_2d ? "bg-white hover:bg-blue-50 border-blue-200 px-6" : "bg-blue-600 hover:bg-blue-700 text-white px-8"}
                      onClick={() => {
                        document.getElementById('2d-drawing-upload')?.click();
                      }}
                      disabled={fileUploading === 'part_drawing_2d'}
                    >
                      {fileUploading === 'part_drawing_2d' ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : partNumber.part_drawing_2d ? (
                        <Edit className="h-5 w-5 mr-2" />
                      ) : (
                        <FileText className="h-5 w-5 mr-2" />
                      )}
                      {fileUploading === 'part_drawing_2d' ? 'Uploading...' : partNumber.part_drawing_2d ? 'Replace' : 'Upload PDF'}
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
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Box className="h-5 w-5 text-green-600" />
              3D Model (STEP/STP)
            </Label>
            <div className="flex items-center gap-4">
              {partNumber.part_drawing_3d ? (
                <div className="flex items-center gap-3 p-6 border-2 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 flex-1 hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Box className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 truncate">{getFileNameFromUrl(partNumber.part_drawing_3d)}</p>
                    <p className="text-xs text-green-600">STEP File • {partNumber.urn ? 'Ready for 3D viewing' : 'Click "View 3D" to convert for viewing'}</p>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-green-50 border-green-200"
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
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-green-50 border-green-200"
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
                        <Button variant="outline" size="sm" className="bg-white hover:bg-red-50 border-red-200">
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
                <div className="flex items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 flex-1 hover:border-green-400 hover:bg-green-50 transition-all duration-200">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Box className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-1">No 3D Model</p>
                    <p className="text-sm text-gray-500">Upload a STEP file for 3D viewing</p>
                  </div>
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
                    handleFileUpload(file, 'part_drawing_3d');
                  }
                }}
                disabled={fileUploading === 'part_drawing_3d'}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={partNumber.part_drawing_3d ? "outline" : "default"}
                      size="lg"
                      className={partNumber.part_drawing_3d ? "bg-white hover:bg-green-50 border-green-200 px-6" : "bg-green-600 hover:bg-green-700 text-white px-8"}
                      onClick={() => {
                        document.getElementById('3d-model-upload')?.click();
                      }}
                      disabled={fileUploading === 'part_drawing_3d'}
                    >
                      {fileUploading === 'part_drawing_3d' ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : partNumber.part_drawing_3d ? (
                        <Edit className="h-5 w-5 mr-2" />
                      ) : (
                        <Box className="h-5 w-5 mr-2" />
                      )}
                      {fileUploading === 'part_drawing_3d' ? 'Uploading...' : partNumber.part_drawing_3d ? 'Replace' : 'Upload STEP'}
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
            // Don't close modal if conversion just completed or if it should stay open
            // But allow closing if there's a conversion error
            if (!conversionJustCompleted && !modalShouldStayOpen.current) {
              setThreeDViewerModalOpen(false);
              setFormError(null); // Clear error when closing modal
              setConvertingToUrn(false); // Reset conversion state
              modalShouldStayOpen.current = false; // Reset modal stay open flag
            } else if (formError) {
              // Allow closing if there's an error, regardless of other flags
              setThreeDViewerModalOpen(false);
              setFormError(null);
              setConvertingToUrn(false);
              modalShouldStayOpen.current = false;
              setConversionJustCompleted(false);
            }
          }}
          urn={partNumber?.urn || null}
          isLoading={convertingToUrn}
          conversionError={formError}
        />
        
        <PDFViewerModal
          open={pdfViewerOpen}
          onOpenChange={setPdfViewerOpen}
          pdfUrl={selectedPdfUrl}
          title={selectedPdfTitle}
        />
    </div>
  );
} 