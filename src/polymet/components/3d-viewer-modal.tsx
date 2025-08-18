import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Box, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AutodeskSimpleViewer from './autodesk-simple-viewer';

interface ThreeDViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  urn: string | null;
  isLoading?: boolean;
  conversionError?: string | null;
}

export default function ThreeDViewerModal({
  isOpen,
  onClose,
  urn,
  isLoading = false,
  conversionError = null
}: ThreeDViewerModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  // Auto-open viewer when modal opens and URN is available
  useEffect(() => {
    if (isOpen && urn && !isLoading && !conversionError) {
      // Small delay to ensure smooth transition from loading to viewer
      const timer = setTimeout(() => setShowViewer(true), 100);
      return () => clearTimeout(timer);
    } else if (isOpen && !urn && !isLoading) {
      setShowViewer(false);
    }
  }, [isOpen, urn, isLoading, conversionError]);

  // Reset viewer state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowViewer(false);
    }
  }, [isOpen]);

    const handleCopyUrn = async () => {
    if (!urn) return;

    try {
      await navigator.clipboard.writeText(urn);
      setCopied(true);
      toast({
        title: "URN Copied",
        description: "The URN has been copied to clipboard.",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URN to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-blue-600" />
            3D Model Viewer
          </DialogTitle>
          <DialogDescription>
            View your 3D model in the browser
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 w-full max-w-full h-full">
                         {isLoading ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="flex items-center gap-3">
                     <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                     <span className="text-lg">Converting STEP file to URN...</span>
                   </div>
                 </div>
               ) : conversionError ? (
                 <div className="text-center py-8">
                   <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                     <div className="flex items-center gap-2 mb-3">
                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                       <h3 className="font-semibold text-red-800 dark:text-red-200">Conversion Failed</h3>
                     </div>
                     <p className="text-red-700 dark:text-red-300 text-sm">
                       {conversionError}
                     </p>
                   </div>
                   <Button onClick={onClose} variant="outline">
                     Close
                   </Button>
                 </div>
               ) : urn ? (
                   <div className="space-y-4">
                   

                   

                     {showViewer && urn && (
                       <div className="w-full h-[500px] overflow-hidden">
                         <AutodeskSimpleViewer
                           urn={urn}
                           onLoad={() => {
                             console.log('3D viewer loaded successfully');
                             toast({
                               title: "3D Viewer Ready",
                               description: "Your 3D model is now loaded",
                             });
                           }}
                           onError={(error: string) => {
                             console.error('3D viewer error:', error);
                             toast({
                               title: "3D Viewer Error",
                               description: error,
                               variant: "destructive",
                             });
                           }}
                         />
                       </div>
                     )}
                   </div>
          ) : (
            <div className="text-center py-8">
              <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No 3D model URN available. Please convert a STEP file first.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 