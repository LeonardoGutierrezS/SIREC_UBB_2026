import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import axios from 'axios';
import '@styles/login.css';
import SirecLogo from '../Images/SIREC LOGO.png';
import UbbLogo from '../Images/UBB_degradado_letras_blancas.png';
import FaceLogo from '../Images/Face_Blanco.png';

const RecoverPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '' });
    const [formErrors, setFormErrors] = useState({ email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = (email) => {
        if (!email) return 'El correo electrónico es obligatorio';
        if (!email.includes('@')) return 'El correo debe ser válido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'El correo electrónico no es válido';
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const recoverSubmit = async (e) => {
        e.preventDefault();
        
        const emailError = validateEmail(formData.email);
        
        if (emailError) {
            setFormErrors({ email: emailError });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:3000/api/password-recovery/request', {
                email: formData.email
            });
            
            if (response.data.status === 'Success') {
                showSuccessAlert(
                    '¡Correo Enviado!', 
                    'Se ha enviado un correo con instrucciones para recuperar tu contraseña'
                );
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (error) {
            console.error('Error al solicitar recuperación:', error);
            
            if (error.response?.status === 404) {
                // El correo no está registrado
                showErrorAlert(
                    'Correo No Registrado', 
                    'No existe una cuenta con este correo. ¿Deseas registrarte?',
                    true,
                    () => navigate('/register')
                );
            } else {
                showErrorAlert(
                    'Error', 
                    error.response?.data?.message || 'Error al conectar con el servidor'
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-header">
                <img src={UbbLogo} alt="Universidad del Bío-Bío" className="header-logo ubb" />
            </div>

            <div className="login-card">
                <img src={SirecLogo} alt="SIREC" className="sirec-logo" />
                
                <h1 className="login-title">Recuperar Contraseña</h1>
                <p className="login-subtitle">Ingresa tu correo electrónico para recuperar tu contraseña</p>
                
                <form className="login-form" onSubmit={recoverSubmit}>
                    <div className="form-field">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            placeholder="ejemplo@correo.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={formErrors.email ? 'error' : ''}
                            disabled={isSubmitting}
                            autoComplete="email"
                        />
                        {formErrors.email && (
                            <span className="error-text">⚠ {formErrors.email}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Recuperar Contraseña'}
                    </button>
                </form>

                <p className="register-link">
                    ¿Recordaste tu contraseña? <a href="/">Inicia sesión aquí</a>
                </p>
            </div>

            <div className="login-footer">
                <img src={FaceLogo} alt="Facultad de Ciencias Empresariales" className="footer-logo face" />
            </div>
        </div>
    );
};

export default RecoverPassword;
