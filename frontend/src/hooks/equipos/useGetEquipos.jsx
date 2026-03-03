import { useState, useEffect, useCallback } from 'react';
import { getEquipos } from '../../services/equipo.service.js';

export function useGetEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEquipos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEquipos();
      
      console.log('Response from getEquipos:', response);
      
      if (response.status === 'Success' && response.data) {
        console.log('Equipos data:', response.data);
        setEquipos(response.data);
      } else if (response.status === 'Client error' || response.status === 'Server error') {
        console.log('Error response:', response);
        setError(response.message || 'Error al cargar los equipos');
        setEquipos([]);
      } else {
        console.log('No success or no data:', response);
        setEquipos([]);
      }
    } catch (err) {
      console.error('Error al obtener equipos:', err);
      setError('Error al cargar los equipos');
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  return { equipos, loading, error, refetch: fetchEquipos };
}
