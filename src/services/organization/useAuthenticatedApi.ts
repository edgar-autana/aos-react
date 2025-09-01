/**
 * Authenticated API Hook
 * Provides properly authenticated API clients using Clerk
 */

import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';
import { getCurrentOrganizationId } from './organizationApi';

export interface AuthHeaders {
  'Content-Type': string;
  'Authorization'?: string;
  'X-Organization-ID'?: string;
}

/**
 * Hook to get authenticated headers
 */
export function useAuthHeaders() {
  const { getToken } = useAuth();

  const getAuthHeaders = useCallback(async (): Promise<AuthHeaders> => {
    const headers: AuthHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      // Get JWT token from Clerk
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    // Include organization ID if set
    const currentOrgId = getCurrentOrganizationId();
    if (currentOrgId) {
      headers['X-Organization-ID'] = currentOrgId;
    }

    return headers;
  }, [getToken]);

  return { getAuthHeaders };
}

/**
 * Hook for authenticated API requests
 */
export function useAuthenticatedRequest() {
  const { getAuthHeaders } = useAuthHeaders();

  const makeRequest = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If error response is not JSON
        const errorText = await response.text();
        if (errorText) {
          errorMessage = `${errorMessage}: ${errorText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }, [getAuthHeaders]);

  return { makeRequest };
}

/**
 * Hook for organization-specific authenticated requests
 */
export function useOrganizationRequest(organizationId?: string) {
  const { getAuthHeaders: baseGetAuthHeaders } = useAuthHeaders();

  const getAuthHeaders = useCallback(async (): Promise<AuthHeaders> => {
    const headers = await baseGetAuthHeaders();
    
    // Override organization ID if specified
    if (organizationId) {
      headers['X-Organization-ID'] = organizationId;
    }
    
    return headers;
  }, [baseGetAuthHeaders, organizationId]);

  const makeRequest = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = `${errorMessage}: ${errorText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }, [getAuthHeaders]);

  return { makeRequest, getAuthHeaders };
}