import { useState, useEffect } from 'react';

const useLogin = () => {
    const [errorEmail, setErrorEmail] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [inputData, setInputData] = useState({ email: '', password: '' });

    useEffect(() => {
        if (inputData.email) {
            setErrorEmail('');
            setGeneralError('');
        }
        if (inputData.password) {
            setErrorPassword('');
            setGeneralError('');
        }
    }, [inputData.email, inputData.password]);

    const errorData = (dataMessage) => {
        // Clear previous errors
        setErrorEmail('');
        setErrorPassword('');
        setGeneralError('');
        
        if (dataMessage && dataMessage.message) {
            const message = dataMessage.message;
            
            // Priorizar asignación específica si dataInfo está presente
            if (dataMessage.dataInfo === 'email') {
                setErrorEmail(message);
            } else if (dataMessage.dataInfo === 'password') {
                setErrorPassword(message);
            } else if (message.includes('y/o') || message.includes('incorrectos') || message.includes('inactivo')) {
                // Fallback para mensajes genéricos o antiguos
                setGeneralError(message);
            } else {
                setGeneralError(message);
            }
        } else if (typeof dataMessage === 'string') {
            setGeneralError(dataMessage);
        }
    };

    const handleInputChange = (field, value) => {
        setInputData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const clearErrors = () => {
        setErrorEmail('');
        setErrorPassword('');
        setGeneralError('');
    };

    return {
        errorEmail,
        errorPassword,
        generalError,
        inputData,
        errorData,
        handleInputChange,
        clearErrors,
    };
};

export default useLogin;