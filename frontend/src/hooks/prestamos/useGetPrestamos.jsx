import { useState, useEffect } from 'react';
import { getPrestamos } from '@services/prestamo.service.js';

export function useGetPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPrestamos();
      
      if (response.status === 'Success' && response.data) {
        setPrestamos(response.data);
      } else if (response.status === 'Client error' || response.status === 'Server error') {
        setError(response.message || 'Error al cargar los préstamos');
        setPrestamos([]);
      } else {
        setPrestamos([]);
      }
    } catch (err) {
      console.error('Error al obtener préstamos:', err);
      setError('Error al cargar los préstamos');
      setPrestamos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  return { prestamos, loading, error, refetch: fetchPrestamos };
}
