import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ForgeViewerProps {
  urn: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    Autodesk: any;
  }
}

export default function ForgeViewer({ urn, onLoad, onError }: ForgeViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<any>(null);

  // Validate URN format
  const validateUrn = (urn: string): boolean => {
    if (!urn) return false;
    // Basic URN validation - should be base64 encoded
    try {
      // Check if it's a valid base64 string
      atob(urn);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Load Autodesk Forge Viewer library
    const loadForgeViewer = () => {
      if (window.Autodesk) {
        initializeViewer();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css';
        document.head.appendChild(link);
        
        setTimeout(() => {
          if (window.Autodesk) {
            initializeViewer();
          } else {
            setError('Failed to load Forge Viewer library');
            onError?.('Failed to load Forge Viewer library');
          }
        }, 1000);
      };
      script.onerror = () => {
        setError('Failed to load Forge Viewer library');
        onError?.('Failed to load Forge Viewer library');
      };
      document.head.appendChild(script);
    };

    const initializeViewer = () => {
      if (!viewerRef.current || !window.Autodesk) return;

      // Validate URN before proceeding
      if (!validateUrn(urn)) {
        setError('Invalid URN format - URN must be base64 encoded');
        setIsLoading(false);
        onError?.('Invalid URN format - URN must be base64 encoded');
        return;
      }

      try {
        // Initialize the viewer
        const viewer = new window.Autodesk.Viewing.GuiViewer3D(
          viewerRef.current,
          { 
            extensions: ['Autodesk.DocumentBrowser'],
            theme: 'light-theme',
            timeout: 60000 // 60 seconds timeout
          }
        );
        
        // Set additional timeout configuration
        if (viewer.setTimeout) {
          viewer.setTimeout(60000); // 60 seconds
        }

        // Set up the viewer
        window.Autodesk.Viewing.Initializer(
          {
            env: 'Local',
            api: 'streamingV2',
            getAccessToken: getForgeToken
          },
          () => {
            viewer.start();
            
            // Load the model using the URN
            
            const documentId = 'urn:' + urn;
            
            // For testing, use a sample model if the URN doesn't work
            const testDocumentId = 'urn:adsk.objects:os.object:dm.obj/0.svf';
            
                                      // Try to load the actual model first
            
            // Set a timeout to prevent infinite loading
            const loadingTimeout = setTimeout(() => {
              setError('Loading timeout - model may not be translated to SVF format yet');
              setIsLoading(false);
              onError?.('Loading timeout - model may not be translated to SVF format yet');
            }, 60000); // 60 seconds timeout - increased for translated models
            
            window.Autodesk.Viewing.Document.load(
              documentId,
              (doc: any) => {
                clearTimeout(loadingTimeout);
                
                // Validate document has valid structure
                if (!doc || !doc.getRoot()) {
                  setError('Document structure is invalid - model may not be translated');
                  setIsLoading(false);
                  onError?.('Document structure is invalid - model may not be translated');
                  return;
                }
                
                const defaultModel = doc.getRoot().getDefaultGeometry();
                
                if (!defaultModel) {
                  setError('No 3D geometry found - model may need translation');
                  setIsLoading(false);
                  onError?.('No 3D geometry found - model may need translation');
                  return;
                }
                
                viewer.loadDocumentNode(doc, defaultModel).then(() => {
                  setIsLoading(false);
                  setViewer(viewer);
                  onLoad?.();
                }).catch((error: any) => {
                  setError('Failed to load model in viewer - may need translation');
                  setIsLoading(false);
                  onError?.('Failed to load model in viewer - may need translation');
                });
              },
              (error: any) => {
                clearTimeout(loadingTimeout);
                
                // More specific error messages
                let errorMessage = 'Failed to load 3D model';
                if (error && error.message) {
                  if (error.message.includes('404')) {
                    errorMessage = 'Model not found - may need translation to SVF format';
                  } else if (error.message.includes('403')) {
                    errorMessage = 'Access denied - check model permissions';
                  } else if (error.message.includes('urn')) {
                    errorMessage = 'Invalid URN format - model may not be translated';
                  } else {
                    errorMessage = `Failed to load model: ${error.message}`;
                  }
                }
                
                setError(errorMessage);
                setIsLoading(false);
                onError?.(errorMessage);
              }
            );
          }
        );
      } catch (err) {
        setError('Failed to initialize 3D viewer');
        setIsLoading(false);
        onError?.('Failed to initialize 3D viewer');
      }
    };

                 const getForgeToken = async (callback: (token: string, expires: number) => void) => {
               try {
                 const aosApiBaseUrl = import.meta.env.VITE_AOS_API_BASE_URL || 'http://localhost:8001';
                 const response = await fetch(`${aosApiBaseUrl}/api/v1/autodesk/forge/token`);
                 
                 if (!response.ok) {
                   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                 }
                 
                 const data = await response.json();
                 callback(data.access_token, data.expires_in);
               } catch (error) {
                 throw new Error('Failed to get Forge access token');
               }
             };

    loadForgeViewer();

    // Cleanup
    return () => {
      if (viewer) {
        viewer.finish();
      }
    };
  }, [urn, onLoad, onError]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg">Loading 3D model...</span>
          </div>
        </div>
      )}
      <div 
        ref={viewerRef} 
        className="w-full h-full min-h-[400px] border rounded-lg"
        style={{ backgroundColor: '#f0f0f0' }}
      />
    </div>
  );
} 