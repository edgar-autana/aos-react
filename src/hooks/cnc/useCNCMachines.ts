import { useState, useEffect } from 'react';

interface CNCMachine {
  id: string;
  description: string;
}

export function useCNCMachines() {
  const [machines, setMachines] = useState<CNCMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Import the API service
        const { cncMachineApi } = await import('@/services/cnc/cncMachineApi');
        const response = await cncMachineApi.getAll();
        
        if (response.error) {
          setError(response.error);
        } else {
          setMachines(response.data || []);
        }
      } catch (err) {
        setError('Failed to load CNC machines');
        console.error('Error fetching CNC machines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  return {
    cncMachines: machines,
    loading,
    error
  };
} 