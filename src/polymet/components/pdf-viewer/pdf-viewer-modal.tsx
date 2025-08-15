import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  RotateCcwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  DownloadIcon
} from "lucide-react";

// Set up PDF.js worker - Force HTTPS
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


interface PDFViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  title?: string;
}

export default function PDFViewerModal({
  open,
  onOpenChange,
  pdfUrl,
  title = "2D Drawing"
}: PDFViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  // URL validation function
  const isValidPDFUrl = useCallback((url: string | null): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  // URL construction and validation
  const constructPdfUrl = useCallback((rawUrl: string | null): string | null => {
    if (!rawUrl) return null;
    
    // If it's already a valid URL, return it
    if (isValidPDFUrl(rawUrl)) {
      return rawUrl;
    }
    
    // Try to construct the URL if it looks like a partial path
    if (rawUrl.includes('.pdf')) {
      // If it starts with a path but no protocol
      if (rawUrl.startsWith('/') || rawUrl.startsWith('part-numbers/')) {
        const baseUrl = 'https://aos-files-bucket.s3.us-east-1.amazonaws.com';
        const fullUrl = rawUrl.startsWith('/') ? `${baseUrl}${rawUrl}` : `${baseUrl}/${rawUrl}`;
        return fullUrl;
      }
    }
    
    return rawUrl;
  }, [isValidPDFUrl]);

  const processedPdfUrl = constructPdfUrl(pdfUrl);
  

  // Reset state when modal opens/closes or URL changes
  useEffect(() => {
    // Force worker reconfiguration
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    
    if (open && processedPdfUrl) {
      setCurrentPage(1);
      setScale(1.0);
      setRotation(0);
      setError(null);
      
      if (!isValidPDFUrl(processedPdfUrl)) {
        setError('Invalid PDF URL format');
        setLoading(false);
      } else {
        // Set loading to false so Document can render
        setLoading(false);
      }
    } else if (open && !processedPdfUrl) {
      setError('No PDF URL provided');
      setLoading(false);
    }
  }, [open, processedPdfUrl, isValidPDFUrl]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, []);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, numPages));
  };

  const handleDownload = () => {
    if (processedPdfUrl) {
      const link = document.createElement('a');
      link.href = processedPdfUrl;
      link.download = title + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setCurrentPage(1);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>PDF viewer for technical drawings</DialogDescription>
        </DialogHeader>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {error ? (
            <div className="text-center max-w-md">
              <Alert className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  URL: {processedPdfUrl}
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleRetry} variant="outline">
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => window.open(processedPdfUrl, '_blank')} 
                    variant="outline"
                  >
                    Open in Browser
                  </Button>
                </div>
              </div>
            </div>
          ) : processedPdfUrl ? (
            <div className="p-4">
              <Document
                key={processedPdfUrl} // Force re-render when URL changes
                file={processedPdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2Icon className="h-6 w-6 animate-spin" />
                    <span>Loading PDF document...</span>
                  </div>
                }
                error={
                  <div className="text-center max-w-md">
                    <Alert>
                      <AlertDescription>Failed to load PDF document</AlertDescription>
                    </Alert>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                />
              </Document>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>No PDF URL provided</p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-t bg-background">
          <div className="flex items-center gap-4">
            {numPages > 0 && (
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {numPages}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navigation Controls */}
            {numPages > 1 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Zoom Controls */}
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOutIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[4ch] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomInIcon className="h-4 w-4" />
            </Button>
            
            {/* Rotate */}
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCcwIcon className="h-4 w-4" />
            </Button>
            
            {/* Download */}
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <DownloadIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}