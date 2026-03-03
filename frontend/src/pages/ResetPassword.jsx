import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import axios from 'axios';
import '@styles/login.css';
import HideIcon from '../assets/HideIcon.svg';
import ViewIcon from '../assets/ViewIcon.svg';
import SirecLogo from '../Images/SIREC LOGO.png';
import UbbLogo from '../Images/UBB_degradado_letras_blancas.png';
import FaceLogo from '../Images/Face_Blanco.png';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [loading, setLoading] = useState(true);

    // Requisitos de seguridad
    const [passwordRequirements, setPasswordRequirements] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false
    });

    useEffect(() => {
        verifyToken();
    }, [token]);

    useEffect(() => {
        validatePasswordRequirements(formData.newPassword);
    }, [formData.newPassword]);

    const verifyToken = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/password-recovery/verify/${token}`);
            if (response.data.status === 'Success') {
                setTokenValid(true);
            }
        } catch (error) {
            showErrorAlert(
                'Enlace Inválido', 
                error.response?.data?.message || 'El enlace de recuperación no es válido o ha expirado'
            );
            setTimeout(() => navigate('/'), 3000);
        } finally {
            setLoading(false);
        }
    };

    const validatePasswordRequirements = (password) => {
        setPasswordRequirements({
            minLength: password.length >= 8 && password.length <= 26,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password)
        });
    };

    const validatePassword = (password) => {
        if (!password) return 'La contraseña es obligatoria';
        if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (password.length > 26) return 'La contraseña debe tener máximo 26 caracteres';
        if (!/[A-Z]/.test(password)) return 'Debe contener al menos una letra mayúscula';
        if (!/[a-z]/.test(password)) return 'Debe contener al menos una letra minúscula';
        if (!/[0-9]/.test(password)) return 'Debe contener al menos un número';
        if (!/^[a-zA-Z0-9\W_]*$/.test(password)) return 'La contraseña contiene caracteres no válidos';
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const resetSubmit = async (e) => {
        e.preventDefault();
        
        const passwordError = validatePassword(formData.newPassword);
        
        if (passwordError) {
            setFormErrors({ newPassword: passwordError });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setFormErrors({ confirmPassword: 'Las contraseñas no coinciden' });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `http://localhost:3000/api/password-recovery/reset/${token}`,
                {
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword
                }
            );
            
            if (response.data.status === 'Success') {
                showSuccessAlert(
                    '¡Contraseña Actualizada!', 
                    'Tu contraseña ha sido actualizada correctamente. Recibirás un correo de confirmación.'
                );
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (error) {
            console.error('Error al resetear contraseña:', error);
            showErrorAlert(
                'Error', 
                error.response?.data?.message || 'Error al actualizar la contraseña'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="login-page">
                <div className="login-header">
                    <img src={UbbLogo} alt="Universidad del Bío-Bío" className="header-logo ubb" />
                </div>
                <div className="login-card">
                    <p style={{ textAlign: 'center', padding: '40px' }}>Verificando enlace...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return null;
    }

    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

    return (
        <div className="login-page">
            <div className="login-header">
                <img src={UbbLogo} alt="Universidad del Bío-Bío" className="header-logo ubb" />
            </div>

            <div className="login-card">
                <img src={SirecLogo} alt="SIREC" className="sirec-logo" />
                
                <h1 className="login-title">Restablecer Contraseña</h1>
                <p className="login-subtitle">Ingresa tu nueva contraseña</p>
                
                <form className="login-form" onSubmit={resetSubmit}>
                    <div className="form-field">
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <div className="password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                name="newPassword"
                                placeholder="••••••••"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={formErrors.newPassword ? 'error' : ''}
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />
                            <button 
                                type="button"
                                className="toggle-password" 
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                <img src={showPassword ? ViewIcon : HideIcon} alt="Ver contraseña" />
                            </button>
                        </div>
                        {formErrors.newPassword && (
                            <span className="error-text">⚠ {formErrors.newPassword}</span>
                        )}
                    </div>

                    {/* Requisitos de seguridad */}
                    <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '15px', 
                        borderRadius: '5px', 
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        <strong style={{ display: 'block', marginBottom: '10px' }}>
                            Requisitos de seguridad:
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ color: passwordRequirements.minLength ? '#28a745' : '#666' }}>
                                {passwordRequirements.minLength ? '✓' : '○'} 8-26 caracteres
                            </div>
                            <div style={{ color: passwordRequirements.hasUpperCase ? '#28a745' : '#666' }}>
                                {passwordRequirements.hasUpperCase ? '✓' : '○'} Al menos una mayúscula
                            </div>
                            <div style={{ color: passwordRequirements.hasLowerCase ? '#28a745' : '#666' }}>
                                {passwordRequirements.hasLowerCase ? '✓' : '○'} Al menos una minúscula
                            </div>
                            <div style={{ color: passwordRequirements.hasNumber ? '#28a745' : '#666' }}>
                                {passwordRequirements.hasNumber ? '✓' : '○'} Al menos un número
                            </div>
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <div className="password-field">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={formErrors.confirmPassword ? 'error' : ''}
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />
                            <button 
                                type="button"
                                className="toggle-password" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex="-1"
                            >
                                <img src={showConfirmPassword ? ViewIcon : HideIcon} alt="Ver contraseña" />
                            </button>
                        </div>
                        {formErrors.confirmPassword && (
                            <span className="error-text">⚠ {formErrors.confirmPassword}</span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={isSubmitting || !allRequirementsMet}
                        style={{ opacity: (!allRequirementsMet && !isSubmitting) ? 0.6 : 1 }}
                    >
                        {isSubmitting ? 'Actualizando...' : 'Restablecer Contraseña'}
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

export default ResetPassword;
