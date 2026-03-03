import { useState, useEffect } from 'react';
import { getCarreras } from '@services/carrera.service.js';

const useRegister = () => {
    const [errorEmail, setErrorEmail] = useState('');
    const [errorRut, setErrorRut] = useState('');
    const [errorCarrera, setErrorCarrera] = useState('');
    const [carreras, setCarreras] = useState([]);
    const [inputData, setInputData] = useState({ email: '', rut: '', carrera: '' });

    useEffect(() => {
        fetchCarreras();
    }, []);

    useEffect(() => {
        if (inputData.email) setErrorEmail('');
        if (inputData.rut) setErrorRut('');
        if (inputData.carrera) setErrorCarrera('');
    }, [inputData.email, inputData.rut, inputData.carrera]);

    const fetchCarreras = async () => {
        const response = await getCarreras();
        if (response.status === 'Success' && response.data) {
            setCarreras(response.data);
        }
    };

    const errorData = (dataMessage) => {
        if (dataMessage.dataInfo === 'email') {
            setErrorEmail(dataMessage.message);
        } else if (dataMessage.dataInfo === 'rut') {
            setErrorRut(dataMessage.message);
        } else if (dataMessage.dataInfo === 'carrera') {
            setErrorCarrera(dataMessage.message);
        }
    };

    const handleInputChange = (field, value) => {
        setInputData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    return {
        errorEmail,
        errorRut,
        errorCarrera,
        carreras,
        inputData,
        errorData,
        handleInputChange,
    };
};

export default useRegister;