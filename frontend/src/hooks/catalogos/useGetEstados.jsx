
import { useState, useEffect } from 'react';
import { getEstados } from '@services/estado.service';

export function useGetEstados() {
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEstados = async () => {
            try {
                const response = await getEstados(); 
                if(response) {
                   setEstados(response);
                } else {
                    setEstados([]);
                }
            } catch (err) {
                console.error("Error al obtener estados:", err);
                setError(err.message || 'Error desconocido al obtener estados');
                setEstados([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEstados();
    }, []);

    return { estados, loading, error };
}
