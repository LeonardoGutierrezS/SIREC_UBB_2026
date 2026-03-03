import { useState, useEffect } from 'react';
import { getCarreras } from '@services/carrera.service';

export function useGetCarreras() {
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const response = await getCarreras(); 
                if(response.status === "Success") {
                   setCarreras(response.data);
                } else {
                    setCarreras([]);
                }
            } catch (err) {
                console.error("Error al obtener carreras:", err);
                setError(err.message || 'Error desconocido al obtener carreras');
                setCarreras([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCarreras();
    }, []);

    return { carreras, loading, error };
}
