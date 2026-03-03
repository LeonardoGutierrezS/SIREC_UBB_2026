import axios from './root.service';

export const getEstados = async () => {
    try {
        const response = await axios.get('/estado');
        const { status, data } = response;
        if (status === 200) {
            return data.data;
        }
    } catch (error) {
        console.error("Error al obtener estados:", error);
        throw error;
    }
};
