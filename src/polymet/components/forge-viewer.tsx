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
        console.error('Invalid URN format:', urn);
        setError('Invalid URN format - URN must be base64 encoded');
        setIsLoading(false);
        onError?.('Invalid URN format - URN must be base64 encoded');
        return;
      }

      try {
        // Initialize the viewer
        console.log('Initializing Forge Viewer with extended timeout...');
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
          console.log('Viewer timeout set to 60 seconds');
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
            console.log('Loading document with URN:', urn);
            console.log('URN length:', urn.length);
            console.log('URN validation:', {
              isBase64: (() => {
                try {
                  atob(urn);
                  return true;
                } catch {
                  return false;
                }
              })(),
              startsWithUrn: urn.startsWith('dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YW9zLWZpbGVzLXVybi9zdGVwLXYyLTNjY2YwODg1LTc4NGItNGNhMy1hMzVjLTMwYmZmMjIyYTY3NC5zdGVw')
            });
            
            const documentId = 'urn:' + urn;
            console.log('Full document ID:', documentId);
            
            // For testing, use a sample model if the URN doesn't work
            const testDocumentId = 'urn:adsk.objects:os.object:dm.obj/0.svf';
            
                                      // Try to load the actual model first
            console.log('Attempting to load document with ID:', documentId);
            console.log('URN being used:', urn);
            
            // Set a timeout to prevent infinite loading
            const loadingTimeout = setTimeout(() => {
              console.log('Loading timeout reached - model may not be translated');
              setError('Loading timeout - model may not be translated to SVF format yet');
              setIsLoading(false);
              onError?.('Loading timeout - model may not be translated to SVF format yet');
            }, 60000); // 60 seconds timeout - increased for translated models
            
            window.Autodesk.Viewing.Document.load(
              documentId,
              (doc: any) => {
                clearTimeout(loadingTimeout);
                console.log('Document loaded successfully:', doc);
                console.log('Document properties:', {
                  hasRoot: !!doc?.getRoot(),
                  rootProperties: doc?.getRoot() ? Object.keys(doc.getRoot()) : 'No root',
                  urn: doc?.getRoot()?.getData()?.urn || 'No URN in document'
                });
                
                // Validate document has valid structure
                if (!doc || !doc.getRoot()) {
                  console.error('Document has no root');
                  setError('Document structure is invalid - model may not be translated');
                  setIsLoading(false);
                  onError?.('Document structure is invalid - model may not be translated');
                  return;
                }
                
                const defaultModel = doc.getRoot().getDefaultGeometry();
                console.log('Default model:', defaultModel);
                
                if (!defaultModel) {
                  console.error('No default geometry found');
                  setError('No 3D geometry found - model may need translation');
                  setIsLoading(false);
                  onError?.('No 3D geometry found - model may need translation');
                  return;
                }
                
                viewer.loadDocumentNode(doc, defaultModel).then(() => {
                  console.log('Model loaded in viewer successfully');
                  setIsLoading(false);
                  setViewer(viewer);
                  onLoad?.();
                }).catch((error: any) => {
                  console.error('Error loading model in viewer:', error);
                  setError('Failed to load model in viewer - may need translation');
                  setIsLoading(false);
                  onError?.('Failed to load model in viewer - may need translation');
                });
              },
              (error: any) => {
                clearTimeout(loadingTimeout);
                console.error('Error loading document:', error);
                console.error('Document ID that failed:', documentId);
                console.error('Error details:', {
                  message: error?.message,
                  status: error?.status,
                  statusText: error?.statusText,
                  response: error?.response
                });
                
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
        console.error('Error initializing viewer:', err);
        setError('Failed to initialize 3D viewer');
        setIsLoading(false);
        onError?.('Failed to initialize 3D viewer');
      }
    };

                 const getForgeToken = async (callback: (token: string, expires: number) => void) => {
               try {
                 const apiBaseUrl = import.meta.env.VITE_API_3D_BASE_URL || 'http://localhost:3001';
                 console.log('Requesting Forge token from backend...', apiBaseUrl);
                 const response = await fetch(`${apiBaseUrl}/api/forge/token`);
                 
                 if (!response.ok) {
                   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                 }
                 
                 const data = await response.json();
                 console.log('Forge token received successfully');
                 console.log('Token details:', {
                   tokenLength: data.access_token?.length || 0,
                   expiresIn: data.expires_in,
                   tokenType: data.token_type
                 });
                 callback(data.access_token, data.expires_in);
               } catch (error) {
                 console.error('Error getting Forge token:', error);
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