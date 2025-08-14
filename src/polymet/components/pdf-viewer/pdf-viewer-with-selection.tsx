import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  RotateCcwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CameraIcon,
  Loader2Icon
} from "lucide-react";
import RegionSelector from './region-selector';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface SelectedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  imageData?: string;
}

interface PDFViewerWithSelectionProps {
  pdfUrl: string | null;
  onRegionSelect: (region: SelectedRegion | null) => void;
  onSnapshotCapture: (imageData: string) => void;
  selectedRegion: SelectedRegion | null;
}

export default function PDFViewerWithSelection({
  pdfUrl,
  onRegionSelect,
  onSnapshotCapture,
  selectedRegion
}: PDFViewerWithSelectionProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

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
        console.log('Constructed URL:', fullUrl);
        return fullUrl;
      }
    }
    
    return rawUrl;
  }, [isValidPDFUrl]);

  const processedPdfUrl = constructPdfUrl(pdfUrl);

  // Log PDF URL for debugging
  useEffect(() => {
    console.log('Original PDF URL:', pdfUrl);
    console.log('Processed PDF URL:', processedPdfUrl);
    console.log('PDF URL is valid:', isValidPDFUrl(processedPdfUrl));
    
    if (processedPdfUrl && !isValidPDFUrl(processedPdfUrl)) {
      setError('Invalid PDF URL format');
      setLoading(false);
    }
  }, [pdfUrl, processedPdfUrl, isValidPDFUrl]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    console.error('Original PDF URL:', pdfUrl);
    console.error('Processed PDF URL that failed:', processedPdfUrl);
    
    // More specific error messages based on error type
    let errorMessage = 'Failed to load PDF document';
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      errorMessage = 'PDF file not found. The document may have been moved or deleted.';
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      errorMessage = 'Access denied. You may not have permission to view this document.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    setError(errorMessage);
    setLoading(false);
  }, [pdfUrl, processedPdfUrl]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, numPages));
  }, [numPages]);

  const handleRegionSelect = useCallback((region: SelectedRegion | null) => {
    if (region) {
      const regionWithPage = { ...region, page: currentPage };
      onRegionSelect(regionWithPage);
      
      // Auto-capture the region when selected
      setTimeout(() => {
        handleSnapshotClick(regionWithPage);
      }, 100); // Small delay to ensure region is set
    } else {
      onRegionSelect(null);
    }
    setIsSelecting(false);
  }, [currentPage, onRegionSelect]);

  const handleSnapshotClick = useCallback((regionToCapture?: SelectedRegion) => {
    const regionData = regionToCapture || selectedRegion;
    if (!regionData || !pageRef.current) return;

    console.log('Capturing region:', regionData);

    // Find the PDF canvas element
    const pdfCanvas = pageRef.current.querySelector('canvas') as HTMLCanvasElement;
    if (!pdfCanvas) {
      console.error('No PDF canvas found');
      return;
    }

    // Get the actual rendered size of the canvas element
    const canvasRect = pdfCanvas.getBoundingClientRect();
    console.log('Canvas DOM size:', canvasRect.width, 'x', canvasRect.height);
    console.log('Canvas actual size:', pdfCanvas.width, 'x', pdfCanvas.height);

    // Calculate scale factors to convert from DOM coordinates to canvas coordinates
    const scaleX = pdfCanvas.width / canvasRect.width;
    const scaleY = pdfCanvas.height / canvasRect.height;

    console.log('Scale factors:', { scaleX, scaleY });

    // Convert region coordinates from DOM space to canvas space
    const canvasX = regionData.x * scaleX;
    const canvasY = regionData.y * scaleY;
    const canvasWidth = regionData.width * scaleX;
    const canvasHeight = regionData.height * scaleY;

    console.log('Region in DOM coordinates:', regionData);
    console.log('Region in canvas coordinates:', { canvasX, canvasY, canvasWidth, canvasHeight });

    // Create a canvas to capture the selected region
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match the region (in canvas coordinates)
    canvas.width = Math.round(canvasWidth);
    canvas.height = Math.round(canvasHeight);

    // Ensure we're not trying to capture outside the PDF canvas bounds
    const clampedX = Math.max(0, Math.min(Math.round(canvasX), pdfCanvas.width - 1));
    const clampedY = Math.max(0, Math.min(Math.round(canvasY), pdfCanvas.height - 1));
    const clampedWidth = Math.min(Math.round(canvasWidth), pdfCanvas.width - clampedX);
    const clampedHeight = Math.min(Math.round(canvasHeight), pdfCanvas.height - clampedY);

    console.log('Clamped region:', { clampedX, clampedY, clampedWidth, clampedHeight });

    // Draw the selected region from the PDF canvas to our new canvas
    try {
      ctx.drawImage(
        pdfCanvas,           // source
        clampedX, clampedY,  // source x, y
        clampedWidth, clampedHeight,  // source width, height
        0, 0,                // destination x, y
        clampedWidth, clampedHeight   // destination width, height
      );
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/png');
      console.log('Generated image data length:', imageData.length);
      onSnapshotCapture(imageData);
    } catch (error) {
      console.error('Error capturing region:', error);
    }
  }, [selectedRegion, onSnapshotCapture]);


  // Clear selection when page changes
  useEffect(() => {
    if (selectedRegion && selectedRegion.page !== currentPage) {
      onRegionSelect(null);
    }
  }, [currentPage, selectedRegion, onRegionSelect]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // Force re-render of the Document component
    setCurrentPage(1);
  }, []);

  if (!processedPdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Alert className="max-w-md">
          <AlertDescription>
            No technical drawing available for this part number.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription className="space-y-2">
            <div>{error}</div>
            {processedPdfUrl && (
              <div className="text-xs text-muted-foreground mt-2">
                URL: {processedPdfUrl}
              </div>
            )}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={handleRetry}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
          >
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
          >
            <RotateCcwIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {selectedRegion && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSnapshotClick()}
              className="gap-2"
            >
              <CameraIcon className="h-4 w-4" />
              Re-capture
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-20 text-center">
            {currentPage} / {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 min-h-0"
      >
        <div className="flex justify-center p-4">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Loading document...
            </div>
          )}
          
          <Document
            file={processedPdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
          >
            <div className="relative" ref={pageRef}>
              <Page
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              
              <RegionSelector
                onRegionSelect={handleRegionSelect}
                selectedRegion={selectedRegion?.page === currentPage ? selectedRegion : null}
                isActive={!loading}
              />
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
}