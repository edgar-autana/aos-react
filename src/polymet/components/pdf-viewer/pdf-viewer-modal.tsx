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
  DownloadIcon,
  FileTextIcon,
  SparklesIcon
} from "lucide-react";

// Set up PDF.js worker - Force HTTPS
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


interface PDFViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  title?: string;
  isGenerating?: boolean;
}

export default function PDFViewerModal({
  open,
  onOpenChange,
  pdfUrl,
  title = "2D Drawing",
  isGenerating = false
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
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>PDF viewer for technical drawings</DialogDescription>
        </DialogHeader>

        {/* PDF Generation Loading */}
        {isGenerating && (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 min-h-0">
            <div className="text-center p-8 max-w-md">
              {/* Animated Icons */}
              <div className="relative mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <FileTextIcon className="h-8 w-8 text-blue-500 animate-pulse" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <SparklesIcon className="h-6 w-6 text-indigo-500 animate-spin" />
                </div>
                
                {/* Progress Bar */}
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Loading Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Generating PDF Document</h3>
                <p className="text-sm text-gray-600">
                  Processing your quotation data and creating the PDF file...
                </p>
                <p className="text-xs text-gray-500">
                  This usually takes a few seconds
                </p>
              </div>

              {/* Spinner */}
              <div className="mt-6">
                <Loader2Icon className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
              </div>
            </div>
          </div>
        )}

        {/* PDF Content */}
        {!isGenerating && (
          <div className="flex-1 overflow-auto bg-gray-100 min-h-0">
          {error ? (
            <div className="flex justify-center items-center h-full">
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
            </div>
          ) : processedPdfUrl ? (
            <div className="flex justify-center p-4">
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
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-muted-foreground">
                <p>No PDF URL provided</p>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Toolbar */}
        {!isGenerating && (
          <div className="flex items-center justify-between p-4 border-t bg-background flex-shrink-0">
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
        )}
      </DialogContent>
    </Dialog>
  );
}