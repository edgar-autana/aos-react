import { useState, useEffect } from 'react';

interface MaterialAlloy {
  id: string;
  description: string;
}

export function useMaterialAlloys() {
  const [alloys, setAlloys] = useState<MaterialAlloy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlloys = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Import the API service
        const { materialAlloyApi } = await import('@/services/material/materialAlloyApi');
        const response = await materialAlloyApi.getAll();
        
        if (response.error) {
          setError(response.error);
        } else {
          setAlloys(response.data || []);
        }
      } catch (err) {
        setError('Failed to load material alloys');
        console.error('Error fetching material alloys:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlloys();
  }, []);

  return {
    materialAlloys: alloys,
    loading,
    error
  };
} 