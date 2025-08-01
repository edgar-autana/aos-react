import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AutodeskViewerWrapperProps {
  urn: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    Autodesk: any;
  }
}

export default function AutodeskViewerWrapper({ urn, onLoad, onError }: AutodeskViewerWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<any>(null);

  useEffect(() => {
    const loadAutodeskViewer = () => {
      if (window.Autodesk) {
        initializeViewer();
        return;
      }

      // Load Autodesk Viewer from CDN (official way)
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
            setError('Failed to load Autodesk Viewer library');
            setIsLoading(false);
            onError?.('Failed to load Autodesk Viewer library');
          }
        }, 1000);
      };
      script.onerror = () => {
        setError('Failed to load Autodesk Viewer library');
        setIsLoading(false);
        onError?.('Failed to load Autodesk Viewer library');
      };
      document.head.appendChild(script);
    };

    const initializeViewer = () => {
      if (!containerRef.current || !window.Autodesk) return;

      try {
        console.log('Initializing Autodesk Viewer (Official Wrapper)...');
        console.log('URN:', urn);
        
        // Initialize Autodesk Viewer (official way from sample)
        window.Autodesk.Viewing.Initializer(
          {
            env: 'Local',
            api: 'streamingV2',
            getAccessToken: getAccessToken
          },
          () => {
            console.log('Autodesk Viewer initialized successfully');
            
            // Create viewer instance
            const viewer = new window.Autodesk.Viewing.GuiViewer3D(
              containerRef.current,
              { 
                extensions: [],
                theme: 'light-theme'
              }
            );
            
            viewer.start();
            
            // Load the model using the URN
            const documentId = 'urn:' + urn;
            console.log('Loading document with ID:', documentId);
            
            window.Autodesk.Viewing.Document.load(
              documentId,
              (doc: any) => {
                console.log('Document loaded successfully:', doc);
                
                // Get the default viewable
                const defaultModel = doc.getRoot().getDefaultGeometry();
                console.log('Default model:', defaultModel);
                
                // Load the model into the viewer
                viewer.loadDocumentNode(doc, defaultModel).then(() => {
                  console.log('Model loaded into viewer successfully');
                  setViewer(viewer);
                  setIsLoading(false);
                  onLoad?.();
                }).catch((error: any) => {
                  console.error('Error loading model into viewer:', error);
                  setError('Failed to load model into viewer');
                  setIsLoading(false);
                  onError?.('Failed to load model into viewer');
                });
              },
              (error: any) => {
                console.error('Error loading document:', error);
                setError(`Failed to load document: ${error?.message || 'Unknown error'}`);
                setIsLoading(false);
                onError?.(`Failed to load document: ${error?.message || 'Unknown error'}`);
              }
            );
          }
        );
      } catch (err) {
        console.error('Error initializing Autodesk viewer:', err);
        setError('Failed to initialize Autodesk viewer');
        setIsLoading(false);
        onError?.('Failed to initialize Autodesk viewer');
      }
    };

    const getAccessToken = async (callback: (token: string, expires: number) => void) => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_3D_BASE_URL || 'http://localhost:3001';
        console.log('Requesting access token from:', apiBaseUrl);
        
        const response = await fetch(`${apiBaseUrl}/api/forge/token`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Access token received successfully');
        callback(data.access_token, data.expires_in);
      } catch (error) {
        console.error('Error getting access token:', error);
        setError('Failed to get access token');
        setIsLoading(false);
        onError?.('Failed to get access token');
      }
    };

    loadAutodeskViewer();

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
            <span className="text-lg">Loading Autodesk Viewer...</span>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[400px] border rounded-lg"
        style={{ backgroundColor: '#f0f0f0' }}
      />
    </div>
  );
} 