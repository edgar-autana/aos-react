import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AutodeskSimpleViewerProps {
  urn: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    Autodesk: any;
  }
}

export default function AutodeskSimpleViewer({ urn, onLoad, onError }: AutodeskSimpleViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);
  const isInitializing = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Checking model status...');

  // Función para verificar el estado del modelo
  const checkModelStatus = async (modelUrn: string): Promise<boolean> => {
    try {
      const aosApiBaseUrl = import.meta.env.VITE_AOS_API_BASE_URL || 'http://localhost:8001';
      console.log('Checking model status for URN:', modelUrn);
      
      const response = await fetch(`${aosApiBaseUrl}/api/v1/autodesk/forge/translate/${modelUrn}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Model status:', data);
      
      if (data.status === 'success' && data.progress === 100) {
        console.log('Model is ready for viewing');
        return true;
      } else {
        console.log('Model is not ready, status:', data.status, 'progress:', data.progress);
        return false;
      }
    } catch (error) {
      console.error('Error checking model status:', error);
      return false;
    }
  };

  // Función para procesar el modelo
  const processModel = async (modelUrn: string): Promise<boolean> => {
    try {
      const aosApiBaseUrl = import.meta.env.VITE_AOS_API_BASE_URL || 'http://localhost:8001';
      console.log('Processing model for URN:', modelUrn);
      setStatus('Processing model...');
      
      const response = await fetch(`${aosApiBaseUrl}/api/v1/autodesk/forge/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urn: modelUrn,
          targetFormat: 'svf'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Model processing started:', data);
      
      // Poll for completion
      return await pollModelStatus(modelUrn);
    } catch (error) {
      console.error('Error processing model:', error);
      return false;
    }
  };

  // Función para poll el estado del modelo
  const pollModelStatus = async (modelUrn: string): Promise<boolean> => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const aosApiBaseUrl = import.meta.env.VITE_AOS_API_BASE_URL || 'http://localhost:8001';
        const response = await fetch(`${aosApiBaseUrl}/api/v1/autodesk/forge/translate/${modelUrn}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Poll attempt', attempts + 1, 'status:', data.status, 'progress:', data.progress);
          
          if (data.status === 'success' && data.progress === 100) {
            console.log('Model processing completed');
            setStatus('Model ready!');
            return true;
          } else if (data.status === 'failed') {
            console.error('Model processing failed');
            setStatus('Processing failed');
            return false;
          }
          
          // Mostrar progreso real con mensaje dinámico
          const progress = data.progress || 0;
          const message = data.message || 'Processing model';
          const stage = data.stage || 'processing';
          
          setStatus(`${message}... ${progress}%`);
          
          // Log detallado del progreso
          console.log(`Progress: ${progress}% - Stage: ${stage} - Message: ${message}`);
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll cada 5 segundos
      } catch (error) {
        console.error('Error polling model status:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.error('Model processing timeout');
    setStatus('Processing timeout');
    return false;
  };

  // Función para obtener el access token
  const getAccessToken = async (callback: (token: string, expires: number) => void) => {
    try {
      const aosApiBaseUrl = import.meta.env.VITE_AOS_API_BASE_URL || 'http://localhost:8001';
      console.log('Requesting access token from:', aosApiBaseUrl);
      
      const response = await fetch(`${aosApiBaseUrl}/api/v1/autodesk/forge/token`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Access token received');
      callback(data.access_token, data.expires_in);
    } catch (error) {
      console.error('Error getting access token:', error);
      setError('Failed to get access token');
      setIsLoading(false);
      onError?.('Failed to get access token');
    }
  };

  // Función para cargar los scripts de Autodesk
  const loadAutodeskScripts = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // Verificar si ya están cargados
      if (window.Autodesk && window.Autodesk.Viewing) {
        resolve();
        return;
      }

      // Cargar CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css';
      document.head.appendChild(link);

      // Cargar JavaScript
      const script = document.createElement('script');
      script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Autodesk script'));
      document.head.appendChild(script);
    });
  };

  // Función para cargar el modelo
  const loadModel = (viewer: any, modelUrn: string, accessToken: string) => {
    console.log('Loading model with URN:', modelUrn);
    
    // Construir el URN completo con prefijo
    const fullUrn = `urn:${modelUrn}`;
    console.log('Full URN:', fullUrn);
    
    // Usar el método Document.load estándar
    window.Autodesk.Viewing.Document.load(fullUrn, (doc: any) => {
      console.log('Document loaded successfully:', doc);
      
      // Obtener los viewables del documento
      const viewables = doc.getRoot().getDefaultGeometry();
      console.log('Default viewables:', viewables);
      
      if (viewables) {
        // Cargar el modelo en el visor
        viewer.loadDocumentNode(doc, viewables).then(() => {
          console.log('Model loaded successfully');
          setIsLoading(false);
          onLoad?.();
          // Ajustar la vista al modelo
          viewer.fitToView();
        }).catch((error: any) => {
          console.error('Error loading model:', error);
          setError('Failed to load model into viewer');
          setIsLoading(false);
          onError?.('Failed to load model into viewer');
        });
      } else {
        console.error('No viewables found in document');
        setError('No viewables found in document');
        setIsLoading(false);
        onError?.('No viewables found in document');
      }
    }, (error: any) => {
      console.error('Error loading document:', error);
      setError(`Failed to load document: ${error?.message || 'Unknown error'}`);
      setIsLoading(false);
      onError?.(`Failed to load document: ${error?.message || 'Unknown error'}`);
    });
  };

  // Función para inicializar el visor
  const initializeViewer = async () => {
    try {
      // Evitar inicialización múltiple
      if (isInitializing.current) {
        console.log('Already initializing, skipping...');
        return;
      }
      
      if (viewerInstance.current) {
        console.log('Viewer already exists, skipping initialization');
        return;
      }
      
      isInitializing.current = true;
      console.log('Starting viewer initialization...');
      setStatus('Loading Autodesk Viewer...');
      await loadAutodeskScripts();
      
      if (!viewerRef.current) {
        console.log('Container not ready, skipping initialization');
        isInitializing.current = false;
        return;
      }

      // Verificar si el modelo está listo
      setStatus('Checking model status...');
      const isModelReady = await checkModelStatus(urn);
      
      if (!isModelReady) {
        setStatus('Model not ready, processing...');
        const processingSuccess = await processModel(urn);
        if (!processingSuccess) {
          setError('Failed to process model');
          setIsLoading(false);
          onError?.('Failed to process model');
          return;
        }
      }

      // Obtener el token primero
      const aosApiBaseUrl = import.meta.env.VITE_AOS_API_BASE_URL || 'http://localhost:8001';
      
      fetch(`${aosApiBaseUrl}/api/v1/autodesk/forge/token`)
        .then(response => response.json())
        .then(data => {
          const accessToken = data.access_token;
          console.log('Access token received, initializing viewer');
          setStatus('Initializing viewer...');
          
          const options = {
            accessToken: accessToken
          };

          console.log('Initializing Autodesk Viewer with URN:', urn);

          // Inicializar Autodesk Viewing
          window.Autodesk.Viewing.Initializer(options, () => {
            console.log('Autodesk Viewer initialized successfully');
            
            // Crear el visor
            const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current, {
              extensions: [],
              theme: 'light-theme'
            });
            
            // Inicializar el visor
            const startedCode = viewer.start();
            if (startedCode > 0) {
              console.error('Error initializing viewer');
              setError('Failed to initialize viewer');
              setIsLoading(false);
              onError?.('Failed to initialize viewer');
              return;
            }

            viewerInstance.current = viewer;

            // Cargar el modelo si tenemos URN
            if (urn) {
              setStatus('Loading 3D model...');
              loadModel(viewer, urn, accessToken);
            }
          });
        })
        .catch(error => {
          console.error('Error getting access token:', error);
          setError('Failed to get access token');
          setIsLoading(false);
          onError?.('Failed to get access token');
        });

            } catch (error) {
          console.error('Error loading Autodesk Viewer:', error);
          setError('Failed to load Autodesk Viewer');
          setIsLoading(false);
          onError?.('Failed to load Autodesk Viewer');
        } finally {
          isInitializing.current = false;
        }
  };

  useEffect(() => {
    // Evitar inicialización múltiple
    if (viewerInstance.current) {
      console.log('Viewer already initialized, skipping...');
      return;
    }

    initializeViewer();

    // Cleanup al desmontar el componente
    return () => {
      if (viewerInstance.current) {
        console.log('Cleaning up viewer...');
        viewerInstance.current.finish();
        viewerInstance.current = null;
      }
    };
  }, [urn]); // Dependencia en urn para reinicializar cuando cambie

  // Removido el segundo useEffect para evitar doble carga

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg">{status}</span>
          </div>
        </div>
      )}
      <div 
        ref={viewerRef}
        className="w-full h-full min-h-[400px] border rounded-lg overflow-hidden"
        style={{ backgroundColor: '#f0f0f0' }}
      />
      {!urn && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-800">
            Please provide a URN to load the model.
          </p>
        </div>
      )}
    </div>
  );
} 