import { useState, useEffect } from 'react';
import { getEquipos } from '@services/equipo.service.js';

export function useGetEquiposDisponibles() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEquiposDisponibles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEquipos();
      
      if (response.status === 'Success' && response.data) {
        // Filtrar solo equipos disponibles
        const disponibles = response.data.filter(equipo => equipo.Disponible === true);
        setEquipos(disponibles);
      } else if (response.status === 'Client error' || response.status === 'Server error') {
        setError(response.message || 'Error al cargar los equipos');
        setEquipos([]);
      } else {
        setEquipos([]);
      }
    } catch (err) {
      console.error('Error al obtener equipos disponibles:', err);
      setError('Error al cargar los equipos');
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquiposDisponibles();
  }, []);

  return { equipos, loading, error, refetch: fetchEquiposDisponibles };
}
