import { useNavigate } from 'react-router-dom';
import { login } from '@services/auth.service.js';
import useLogin from '@hooks/auth/useLogin.jsx';
import '@styles/login.css';
import { useState } from 'react';
import HideIcon from '../assets/HideIcon.svg';
import ViewIcon from '../assets/ViewIcon.svg';
import SirecLogo from '../Images/SIREC LOGO.png';
import UbbLogo from '../Images/UBB_degradado_letras_blancas.png';
import FaceLogo from '../Images/Face_Blanco.png';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [formErrors, setFormErrors] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        errorEmail,
        errorPassword,
        generalError,
        errorData,
        handleInputChange
    } = useLogin();

    const validateEmail = (email) => {
        if (!email) return 'El correo electrónico es obligatorio';
        if (!email.includes('@')) return 'El correo debe ser válido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'El correo electrónico no es válido';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'La contraseña es obligatoria';
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        handleInputChange(name, value);
        
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const loginSubmit = async (e) => {
        e.preventDefault();
        
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        
        if (emailError || passwordError) {
            setFormErrors({ email: emailError, password: passwordError });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await login(formData);
            if (response.status === 'Success') {
                navigate('/home');
            } else if (response.status === 'Client error') {
                errorData(response.details);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setFormErrors({ email: '', password: 'Error al conectar con el servidor' });
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
                
                <h1 className="login-title">Iniciar Sesión</h1>
                <p className="login-subtitle">Ingresa tus credenciales para acceder al sistema</p>
                
                <form className="login-form" onSubmit={loginSubmit}>
                    <div className="form-field">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            placeholder="ejemplo@correo.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={formErrors.email || errorEmail || generalError ? 'error' : ''}
                            disabled={isSubmitting}
                            autoComplete="email"
                        />
                        {(formErrors.email || errorEmail) && (
                            <span className="error-text">
                                ⚠ {formErrors.email || errorEmail}
                                {(errorEmail === 'Este correo electrónico no está registrado.') && (
                                    <a href="/register" style={{ marginLeft: '5px', color: '#dc2626', fontWeight: 'bold', textDecoration: 'underline' }}>
                                        ¿Deseas registrarte?
                                    </a>
                                )}
                            </span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Contraseña</label>
                        <div className="password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className={formErrors.password || errorPassword || generalError ? 'error' : ''}
                                disabled={isSubmitting}
                                autoComplete="current-password"
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
                        {generalError && (
                            <span className="error-text">⚠ {generalError}</span>
                        )}
                        {!generalError && (formErrors.password || errorPassword) && (
                            <span className="error-text">⚠ {formErrors.password || errorPassword}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="register-link">
                    ¿Olvidaste tu contraseña? <a href="/recover-password">Recupérala aquí</a>
                </p>

                <p className="register-link">
                    ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
                </p>

                <div className="login-support">
                    <p>¿Problemas con tu cuenta? Contacta a soporte:</p>
                    <a href="mailto:labespecialidades.face@ubiobio.cl">labespecialidades.face@ubiobio.cl</a>
                </div>
            </div>

            <div className="login-footer">
                <img src={FaceLogo} alt="Facultad de Ciencias Empresariales" className="footer-logo face" />
            </div>
        </div>
    );
};

export default Login;