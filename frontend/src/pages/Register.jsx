import { useNavigate } from 'react-router-dom';
import { register } from '@services/auth.service.js';
import useRegister from '@hooks/auth/useRegister.jsx';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { formatRut, validateRut, validateRutFormat } from '@helpers/rutFormatter.js';
import { useState, useEffect } from 'react';
import '@styles/register.css';
import HideIcon from '../assets/HideIcon.svg';
import ViewIcon from '../assets/ViewIcon.svg';
import SirecLogo from '../Images/SIREC LOGO.png';
import UbbLogo from '../Images/UBB_degradado_letras_blancas.png';
import FaceLogo from '../Images/Face_Blanco.png';

const Register = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [tipoUsuario, setTipoUsuario] = useState('Alumno');
	const [formData, setFormData] = useState({
		nombreCompleto: '',
		rut: '',
		email: '',
		password: '',
		carreraId: '',
		cargo: ''
	});
	const [formErrors, setFormErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	const {
        errorEmail,
        errorRut,
        errorCarrera,
        carreras,
        errorData,
        handleInputChange
    } = useRegister();

const validateNombreCompleto = (nombre) => {
		if (!nombre) return 'El nombre completo es obligatorio';
		if (nombre.length < 3) return 'El nombre debe tener al menos 3 caracteres';
		if (nombre.length > 50) return 'El nombre debe tener máximo 50 caracteres';
		if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return 'El nombre solo puede contener letras y espacios';
		return '';
	};

	const validateRutInternal = (rut) => {
		if (!rut) return 'El rut es obligatorio';
		if (!validateRutFormat(rut)) return 'Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x';
		if (!validateRut(rut)) return 'El RUT ingresado no es válido (dígito verificador incorrecto)';
		return '';
	};

	const validateEmail = (email) => {
		if (!email) return 'El correo electrónico es obligatorio';
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return 'El correo electrónico no es válido';
		return '';
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

	const validateCarrera = (carreraId) => {
		if (tipoUsuario === 'Alumno' && !carreraId) return 'La carrera es obligatoria para alumnos';
		return '';
	};

	const validateCargo = (cargo) => {
		if (tipoUsuario === 'Profesor' && !cargo) return 'El cargo es obligatorio para profesores';
		if (tipoUsuario === 'Profesor' && cargo.length < 3) return 'El cargo debe tener al menos 3 caracteres';
		if (tipoUsuario === 'Profesor' && cargo.length > 100) return 'El cargo debe tener máximo 100 caracteres';
		return '';
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		
		// Si es el campo RUT, formatear automáticamente
		if (name === 'rut') {
			const formattedRut = formatRut(value);
			setFormData(prev => ({ ...prev, [name]: formattedRut }));
			handleInputChange(name, formattedRut);
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
			handleInputChange(name, value);
		}
		
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: '' }));
		}
	};

	const handleTipoUsuarioChange = (tipo) => {
		setTipoUsuario(tipo);
		setFormData(prev => ({
			...prev,
			carreraId: '',
			cargo: ''
		}));
		setFormErrors({});
	};

	const registerSubmit = async (e) => {
		e.preventDefault();
		console.log("Intentando registrar usuario...", formData);
		
		const errors = {
			nombreCompleto: validateNombreCompleto(formData.nombreCompleto),
			rut: validateRutInternal(formData.rut),
			email: validateEmail(formData.email),
			password: validatePassword(formData.password),
		};

		if (tipoUsuario === 'Alumno') {
			errors.carreraId = validateCarrera(formData.carreraId);
		} else {
			errors.cargo = validateCargo(formData.cargo);
		}

		console.log("Errores de validación detectados:", errors);

		const hasErrors = Object.values(errors).some(error => error !== '');
		
		if (hasErrors) {
			console.log("Formulario contiene errores, deteniendo envío.");
			setFormErrors(errors);
			return;
		}

		setIsSubmitting(true);
		console.log("Enviando datos al backend...");
		try {
			const dataToSend = {
				nombreCompleto: formData.nombreCompleto,
				rut: formData.rut,
				email: formData.email,
				password: formData.password,
				tipoUsuario: tipoUsuario,
				...(tipoUsuario === 'Alumno' ? { carreraId: parseInt(formData.carreraId) } : { cargo: formData.cargo })
			};
            console.log("Payload:", dataToSend);

			const response = await register(dataToSend);
			console.log("Respuesta del servidor:", response);

			if (response.status === 'Success') {
				showSuccessAlert(
					'¡Registro Exitoso!',
					'Tu cuenta ha sido creada y está pendiente de aprobación por el administrador.'
				);
				setTimeout(() => {
					navigate('/auth');
				}, 3000);
			} else if (response.status === 'Client error') {
				if (response.details?.dataInfo && response.details?.message) {
					setFormErrors(prev => ({
						...prev,
						[response.details.dataInfo]: response.details.message
					}));
				} else {
					showErrorAlert('Error', response.details || 'Error al registrarse');
				}
			}
		} catch (error) {
			console.error("Error al registrar un usuario: ", error);
			showErrorAlert('Error', 'Ocurrió un error al registrarse.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="register-page">
			<div className="register-header">
				<img src={UbbLogo} alt="Universidad del Bío-Bío" className="header-logo ubb" />
			</div>

			<div className="register-card">
				<img src={SirecLogo} alt="SIREC" className="sirec-logo" />
				
				<h1 className="register-title">Crear Cuenta</h1>
				<p className="register-subtitle">Completa el formulario para registrarte en el sistema</p>
				
				{/* Selector de tipo de usuario */}
				<div className="user-type-selector">
					<button
						type="button"
						className={`type-button ${tipoUsuario === 'Alumno' ? 'active' : ''}`}
						onClick={() => handleTipoUsuarioChange('Alumno')}
					>
						Alumno
					</button>
					<button
						type="button"
						className={`type-button ${tipoUsuario === 'Profesor' ? 'active' : ''}`}
						onClick={() => handleTipoUsuarioChange('Profesor')}
					>
						Profesor
					</button>
				</div>

				<form className="register-form" onSubmit={registerSubmit}>
					<div className="form-field">
						<label htmlFor="nombreCompleto">Nombre Completo</label>
						<input
							type="text"
							id="nombreCompleto"
							name="nombreCompleto"
							placeholder="Diego Alexis Salazar Jara"
							value={formData.nombreCompleto}
							onChange={handleChange}
							className={formErrors.nombreCompleto ? 'error' : ''}
							disabled={isSubmitting}
						/>
						{formErrors.nombreCompleto && (
							<span className="error-text">⚠ {formErrors.nombreCompleto}</span>
						)}
					</div>

					<div className="form-field">
						<label htmlFor="rut">Rut</label>
						<input
							type="text"
							id="rut"
							name="rut"
							placeholder="23.770.330-1"
							value={formData.rut}
							onChange={handleChange}
							className={formErrors.rut || errorRut ? 'error' : ''}
							disabled={isSubmitting}
						/>
						{(formErrors.rut || errorRut) && (
							<span className="error-text">⚠ {formErrors.rut || errorRut}</span>
						)}
					</div>

					<div className="form-field">
						<label htmlFor="email">Correo Electrónico</label>
						<input
							type="text"
							id="email"
							name="email"
							placeholder="ejemplo@correo.com"
							value={formData.email}
							onChange={handleChange}
							className={formErrors.email || errorEmail ? 'error' : ''}
							disabled={isSubmitting}
							autoComplete="email"
						/>
						{(formErrors.email || errorEmail) && (
							<span className="error-text">⚠ {formErrors.email || errorEmail}</span>
						)}
					</div>

					{tipoUsuario === 'Alumno' && (
						<div className="form-field">
							<label htmlFor="carreraId">Carrera</label>
							<select
								id="carreraId"
								name="carreraId"
								value={formData.carreraId}
								onChange={handleChange}
								className={formErrors.carreraId || errorCarrera ? 'error' : ''}
								disabled={isSubmitting}
							>
								<option value="">Selecciona una carrera</option>
								{carreras.map(carrera => (
									<option key={carrera.ID_Carrera} value={carrera.ID_Carrera}>
										{carrera.Nombre_Carrera}
									</option>
								))}
							</select>
							{(formErrors.carreraId || errorCarrera) && (
								<span className="error-text">⚠ {formErrors.carreraId || errorCarrera}</span>
							)}
						</div>
					)}

					{tipoUsuario === 'Profesor' && (
						<div className="form-field">
							<label htmlFor="cargo">Cargo</label>
							<input
								type="text"
								id="cargo"
								name="cargo"
								placeholder="Ej: Profesor Asistente, Director de Carrera"
								value={formData.cargo}
								onChange={handleChange}
								className={formErrors.cargo ? 'error' : ''}
								disabled={isSubmitting}
							/>
							{formErrors.cargo && (
								<span className="error-text">⚠ {formErrors.cargo}</span>
							)}
						</div>
					)}

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
								className={formErrors.password ? 'error' : ''}
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
						{formErrors.password && (
							<span className="error-text">⚠ {formErrors.password}</span>
						)}
					</div>

					{/* Requisitos de seguridad interactivos (Paridad con ResetPassword) */}
					<div style={{ 
						backgroundColor: '#f8f9fa', 
						padding: '15px', 
						borderRadius: '5px', 
						marginBottom: '20px',
						fontSize: '14px',
						border: '1px solid #e2e8f0'
					}}>
						<strong style={{ display: 'block', marginBottom: '10px', color: '#1e293b' }}>
							Requisitos de seguridad:
						</strong>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
							<div style={{ color: (formData.password.length >= 8 && formData.password.length <= 26) ? '#28a745' : '#666' }}>
								{(formData.password.length >= 8 && formData.password.length <= 26) ? '✓' : '○'} 8-26 caracteres
							</div>
							<div style={{ color: /[A-Z]/.test(formData.password) ? '#28a745' : '#666' }}>
								{/[A-Z]/.test(formData.password) ? '✓' : '○'} Al menos una mayúscula
							</div>
							<div style={{ color: /[a-z]/.test(formData.password) ? '#28a745' : '#666' }}>
								{/[a-z]/.test(formData.password) ? '✓' : '○'} Al menos una minúscula
							</div>
							<div style={{ color: /[0-9]/.test(formData.password) ? '#28a745' : '#666' }}>
								{/[0-9]/.test(formData.password) ? '✓' : '○'} Al menos un número
							</div>
							<div style={{ color: (formData.password.length > 0) ? '#28a745' : '#666' }}>
								{(formData.password.length > 0) ? '✓' : '○'} Caracteres válidos (letras, números, símbolos)
							</div>
						</div>
					</div>

					<button type="submit" className="submit-button" disabled={isSubmitting}>
						{isSubmitting ? 'Registrando...' : 'Registrarse'}
					</button>
				</form>

				<p className="login-link">
					¿Ya tienes cuenta? <a href="/auth">Inicia sesión aquí</a>
				</p>
			</div>

			<div className="register-footer">
				<img src={FaceLogo} alt="Facultad de Ciencias Empresariales" className="footer-logo face" />
			</div>
		</div>
	);
};

export default Register;