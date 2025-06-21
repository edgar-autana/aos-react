import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileIcon,
  FileTextIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateCwIcon,
  DownloadIcon,
  XIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FilePreviewProps {
  fileType: "pdf" | "cad" | null;
  fileUrl?: string;
  fileName?: string;
}

export default function FilePreview({
  fileType,
  fileUrl,
  fileName,
}: FilePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!fileType || !fileUrl) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />

            <h3 className="text-lg font-medium mb-2">No File Available</h3>
            <p className="text-sm text-muted-foreground">
              This part doesn't have a{" "}
              {fileType === "pdf" ? "drawing" : "3D model"} file uploaded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="bg-muted p-2 flex items-center justify-between border-b">
        <div className="flex items-center">
          {fileType === "pdf" ? (
            <FileTextIcon className="h-4 w-4 mr-2 text-red-500" />
          ) : (
            <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
          )}
          <span className="text-sm font-medium truncate max-w-[200px]">
            {fileName || (fileType === "pdf" ? "Drawing.pdf" : "Model.step")}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
          >
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
          >
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRotate}
          >
            <RotateCwIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <DownloadIcon className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      <CardContent className="p-0 h-[400px] overflow-auto bg-muted/30">
        {fileType === "pdf" ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
            }}
          >
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              title="PDF Viewer"
            />
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
            }}
          >
            {/* For CAD files, we'd typically need a specialized viewer */}
            {/* This is a placeholder for a CAD viewer */}
            <div className="relative w-full h-full">
              <img
                src="https://picsum.photos/seed/cad-preview/800/600"
                alt="CAD Preview"
                className="w-full h-full object-contain"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <Alert className="w-auto">
                  <AlertDescription>
                    Interactive 3D model viewer would be integrated here. Common
                    options include Three.js, Autodesk Forge Viewer, or other
                    WebGL-based viewers.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FilePreviewTabs({
  pdfUrl,
  pdfName,
  cadUrl,
  cadName,
}: {
  pdfUrl?: string;
  pdfName?: string;
  cadUrl?: string;
  cadName?: string;
}) {
  return (
    <Tabs defaultValue={pdfUrl ? "drawing" : "model"} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="drawing" disabled={!pdfUrl}>
          <FileTextIcon className="h-4 w-4 mr-2" />
          Drawing
        </TabsTrigger>
        <TabsTrigger value="model" disabled={!cadUrl}>
          <FileIcon className="h-4 w-4 mr-2" />
          3D Model
        </TabsTrigger>
      </TabsList>
      <TabsContent value="drawing">
        <FilePreview fileType="pdf" fileUrl={pdfUrl} fileName={pdfName} />
      </TabsContent>
      <TabsContent value="model">
        <FilePreview fileType="cad" fileUrl={cadUrl} fileName={cadName} />
      </TabsContent>
    </Tabs>
  );
}
