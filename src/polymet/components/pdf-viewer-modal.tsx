import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  RotateCcwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  DownloadIcon,
  ExternalLinkIcon
} from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title: string;
  isLoading?: boolean;
}

export default function PDFViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  isLoading = false
}: PDFViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoadError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setPdfLoadError(`Failed to load PDF: ${error.message}`);
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

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>PDF viewer for quotation documents</DialogDescription>
        </DialogHeader>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2Icon className="h-6 w-6 animate-spin" />
              <span>Generating PDF document...</span>
            </div>
          ) : pdfLoadError ? (
            <div className="text-center max-w-md">
              <Alert className="mb-4">
                <AlertDescription>{pdfLoadError}</AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => window.open(pdfUrl || '', '_blank')} 
                  variant="outline"
                >
                  Open in Browser
                </Button>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="p-4">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2Icon className="h-6 w-6 animate-spin" />
                    <span>Loading PDF document...</span>
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
              <p>No PDF document available</p>
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

            {/* Open in New Tab */}
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}