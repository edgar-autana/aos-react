import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, FileIcon, FileTextIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  accept: string;
  label: string;
  icon: React.ReactNode;
  onFileChange: (file: File | null) => void;
  file: File | null;
  disabled?: boolean;
}

export default function FileUploadZone({
  accept,
  label,
  icon,
  onFileChange,
  file,
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
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
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        onFileChange(selectedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    // Simple validation based on file extension
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (
      !acceptedTypes.some(
        (type) => type === fileExtension || type === file.type
      )
    ) {
      alert(`Please upload a valid ${label} file`);
      return false;
    }
    return true;
  };

  const handleRemoveFile = () => {
    if (disabled) return;
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 transition-colors",
        isDragging && !disabled ? "border-primary bg-primary/5" : "border-border",
        file ? "bg-secondary/50" : "",
        disabled ? "opacity-50 cursor-not-allowed" : ""
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
        disabled={disabled}
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
                disabled={disabled}
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
                Drag and drop or click to upload
              </p>
              <Button onClick={handleButtonClick} variant="secondary" disabled={disabled}>
                <UploadIcon className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
