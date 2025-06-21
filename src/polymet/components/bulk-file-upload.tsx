import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UploadIcon,
  FileIcon,
  FileTextIcon,
  XIcon,
  PlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  file: File;
  type: "drawing" | "model";
  partName: string;
}

interface BulkFileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
}

export default function BulkFileUpload({
  onFilesChange,
  uploadedFiles,
}: BulkFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const type = fileExtension === "pdf" ? "drawing" : "model";
      const partName = file.name.split(".")[0].replace(/_/g, " ");

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type,
        partName,
      };
    });

    onFilesChange([...uploadedFiles, ...newFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    onFilesChange(uploadedFiles.filter((file) => file.id !== id));
  };

  const handlePartNameChange = (id: string, newName: string) => {
    onFilesChange(
      uploadedFiles.map((file) =>
        file.id === id ? { ...file, partName: newName } : file
      )
    );
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,.stp,.step,.stl,.obj"
          className="hidden"
          multiple
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
            <UploadIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-1">Upload Multiple Files</p>
            <p className="text-xs text-muted-foreground mb-4">
              Drag and drop or click to upload PDF drawings and 3D models
            </p>
            <Button onClick={handleButtonClick} variant="secondary">
              <UploadIcon className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {uploadedFile.type === "drawing" ? (
                      <FileTextIcon className="h-8 w-8 text-blue-500" />
                    ) : (
                      <FileIcon className="h-8 w-8 text-green-500" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium uppercase px-1.5 py-0.5 rounded bg-secondary">
                          {uploadedFile.type === "drawing"
                            ? "PDF Drawing"
                            : "3D Model"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {uploadedFile.file.name} (
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`part-name-${uploadedFile.id}`}
                          className="text-xs whitespace-nowrap"
                        >
                          Part Name:
                        </Label>
                        <Input
                          id={`part-name-${uploadedFile.id}`}
                          value={uploadedFile.partName}
                          onChange={(e) =>
                            handlePartNameChange(
                              uploadedFile.id,
                              e.target.value
                            )
                          }
                          className="h-7 text-sm"
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(uploadedFile.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleButtonClick}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add More Files
          </Button>
        </div>
      )}
    </div>
  );
}
