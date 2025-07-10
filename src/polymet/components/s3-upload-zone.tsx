import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadIcon, FileIcon, XIcon, CheckIcon, AlertCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { s3Service } from "@/lib/s3";

interface S3UploadZoneProps {
  accept: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  onFileChange: (file: File | null) => void;
  onUploadComplete?: (fileUrl: string) => void;
  file: File | null;
  maxSize?: number; // in MB
  className?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
}

export default function S3UploadZone({
  accept,
  label,
  description,
  icon,
  onFileChange,
  onUploadComplete,
  file,
  maxSize = 10,
  className,
}: S3UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        onFileChange(droppedFile);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        onFileChange(selectedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        error: `File size must be less than ${maxSize}MB`
      }));
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (
      !acceptedTypes.some(
        (type) => type === fileExtension || type === file.type
      )
    ) {
      setUploadState(prev => ({
        ...prev,
        error: `Please upload a valid ${label} file`
      }));
      return false;
    }

    setUploadState(prev => ({ ...prev, error: null }));
    return true;
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedUrl: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadToS3 = async (file: File) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      // Update progress to show upload starting
      setUploadState(prev => ({ ...prev, progress: 25 }));

      // Use the existing s3Service for direct upload
      const uploadResult = await s3Service.uploadFile({
        file,
        folder: 'technical-analysis',
        contentType: file.type
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setUploadState(prev => ({ ...prev, progress: 100 }));
      
      setUploadState(prev => ({
        ...prev,
        uploadedUrl: uploadResult.url || null,
        isUploading: false,
      }));

      onUploadComplete?.(uploadResult.url);

    } catch (error) {
      console.error('S3 upload error:', error);
      setUploadState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
        isUploading: false,
      }));
    }
  };

  const handleAnalyze = () => {
    if (file) {
      uploadToS3(file);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-md">{label}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            file ? "bg-secondary/50" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept={accept}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            {file ? (
              <div className="w-full">
                <div className="flex items-center justify-between bg-background rounded-md p-3">
                  <div className="flex items-center space-x-3">
                    {icon}
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="h-8 w-8"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                  {icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1">{label}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Drag and drop or click to upload (Max {maxSize}MB)
                  </p>
                  <Button onClick={handleButtonClick} variant="secondary">
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading to S3...</span>
              <span>{uploadState.progress}%</span>
            </div>
            <Progress value={uploadState.progress} className="h-2" />
          </div>
        )}



        {/* Error Display */}
        {(uploadState.error || uploadState.error) && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircleIcon className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive">
              {uploadState.error}
            </span>
          </div>
        )}

        {/* Upload Button */}
        {file && !uploadState.isUploading && !uploadState.uploadedUrl && (
          <Button
            onClick={handleAnalyze}
            className="w-full"
            disabled={uploadState.isUploading}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload to S3
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 