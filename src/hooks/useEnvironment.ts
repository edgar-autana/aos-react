import { useState, useEffect, useRef } from 'react';

// Global instance to prevent multiple calls
let globalEnvInfo: EnvironmentInfo | null = null;
let globalLoading = false;
let globalError: string | null = null;
const envListeners: Array<(data: { envInfo: EnvironmentInfo | null; loading: boolean; error: string | null }) => void> = [];

export interface EnvironmentInfo {
  environment: string;
  status: string;
  description: string;
  color: string;
  database: string;
  show_banner: boolean;
}

// Global function to fetch environment info once
const fetchGlobalEnvironmentInfo = async () => {
  if (globalLoading) return;
  
  try {
    globalLoading = true;
    globalError = null;
    notifyListeners();
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    const response = await fetch(`${apiUrl}/environment`);
    
    if (response.ok) {
      globalEnvInfo = await response.json();
    } else {
      
      // Fallback to frontend environment variable
      const frontendEnv = import.meta.env.VITE_ENVIRONMENT;
      if (frontendEnv === 'STAGING') {
        globalEnvInfo = {
          environment: frontendEnv,
          status: '🚧 STAGING (Frontend)',
          description: 'Frontend staging mode - Backend unavailable',
          color: 'yellow',
          database: 'Frontend Config',
          show_banner: true
        };
      } else {
        globalEnvInfo = {
          environment: frontendEnv || 'DEVELOPMENT',
          status: '🔧 DEVELOPMENT (Frontend)',
          description: 'Frontend development mode',
          color: 'blue',
          database: 'Frontend Config',
          show_banner: false
        };
      }
      
      globalError = `Backend returned ${response.status}`;
    }

  } catch (error) {
    
    // Fallback to frontend environment variable
    const frontendEnv = import.meta.env.VITE_ENVIRONMENT;
    if (frontendEnv === 'STAGING') {
      globalEnvInfo = {
        environment: frontendEnv,
        status: '🚧 STAGING (Frontend)',
        description: 'Frontend staging mode - Backend error',
        color: 'yellow',
        database: 'Frontend Config',
        show_banner: true
      };
    } else {
      globalEnvInfo = {
        environment: frontendEnv || 'DEVELOPMENT',
        status: '🔧 DEVELOPMENT (Frontend)',
        description: 'Frontend development mode',
        color: 'blue',
        database: 'Frontend Config',
        show_banner: false
      };
    }
    
    globalError = error instanceof Error ? error.message : 'Unknown error';
  } finally {
    globalLoading = false;
    notifyListeners();
  }
};

// Notify all listeners of state changes
const notifyListeners = () => {
  envListeners.forEach(listener => 
    listener({ 
      envInfo: globalEnvInfo, 
      loading: globalLoading, 
      error: globalError 
    })
  );
};

/**
 * Optimized hook to fetch and manage environment information
 * Uses global state to prevent multiple API calls
 */
export const useEnvironment = () => {
  const [state, setState] = useState({
    envInfo: globalEnvInfo,
    loading: globalLoading,
    error: globalError
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    // Add this component as a listener
    const updateState = (newState: { envInfo: EnvironmentInfo | null; loading: boolean; error: string | null }) => {
      setState(newState);
    };
    
    envListeners.push(updateState);

    // Fetch data only once globally
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (!globalEnvInfo && !globalLoading) {
        fetchGlobalEnvironmentInfo();
      }
    }

    // Cleanup listener on unmount
    return () => {
      const index = envListeners.indexOf(updateState);
      if (index > -1) {
        envListeners.splice(index, 1);
      }
    };
  }, []);

  const refetch = () => {
    fetchGlobalEnvironmentInfo();
  };

  return {
    envInfo: state.envInfo,
    loading: state.loading,
    error: state.error,
    refetch
  };
};