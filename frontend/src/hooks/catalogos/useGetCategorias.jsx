import { useState, useEffect } from 'react';
import { getCategorias } from '../../services/catalogo.service.js';

export function useGetCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCategorias();
      
      if (response.status === 'Success' && response.data) {
        setCategorias(response.data);
      } else if (response.status === 'Client error' || response.status === 'Server error') {
        setError(response.message || 'Error al cargar las categorías');
        setCategorias([]);
      } else {
        setCategorias([]);
      }
    } catch (err) {
      console.error('Error al obtener categorías:', err);
      setError('Error al cargar las categorías');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return { categorias, loading, error, refetch: fetchCategorias };
}
