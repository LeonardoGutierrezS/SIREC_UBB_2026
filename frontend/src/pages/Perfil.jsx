import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { updateUser } from '@services/user.service.js';
import { getMisPrestamos } from '@services/prestamo.service';
import { getActivasPorUsuario } from '@services/penalizacion.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import '@styles/perfil.css';

const Perfil = () => {
    const user = JSON.parse(sessionStorage.getItem('usuario')) || {};
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [solicitudes, setSolicitudes] = useState([]);
    const [sanciones, setSanciones] = useState([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const navigate = useNavigate();

    const esDirectorEscuela = user?.esDirectorEscuela || false;
    const userRole = esDirectorEscuela ? 'Director de Escuela' : user?.tipoUsuario;

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                setLoadingSolicitudes(true);
                const response = await getMisPrestamos();
                if (response.status === 'Success' && response.data) {
                    setSolicitudes(response.data.slice(0, 5)); // Solo las 5 más recientes
                }
            } catch (error) {
                console.error('Error al cargar solicitudes en perfil:', error);
            } finally {
                setLoadingSolicitudes(false);
            }
        };

        const fetchSanciones = async () => {
            if (user?.rut) {
                const [data] = await getActivasPorUsuario(user.rut);
                if (data) setSanciones(data);
            }
        };

        if (user?.rut) {
            fetchSanciones();
            if (userRole !== 'Administrador' && userRole !== 'Director de Escuela') {
                fetchSolicitudes();
            }
        }
    }, [user?.rut]);

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showErrorAlert('Error', 'Las nuevas contraseñas no coinciden');
        }

        if (passwords.newPassword.length < 8) {
            return showErrorAlert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
        }

        setLoading(true);
        try {
            const data = {
                password: passwords.currentPassword,
                newPassword: passwords.newPassword
            };

            const response = await updateUser(data, user.rut);

            if (response.status === 'Success') {
                showSuccessAlert('¡Éxito!', 'Tu contraseña ha sido actualizada correctamente.');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showErrorAlert('Error', response.details?.message || response.message || 'Error al actualizar contraseña');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorAlert('Error', 'No se pudo actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="perfil-container main-container">
            <header className="perfil-header">
                <h1>Mi Perfil</h1>
                <p>Gestiona tu información personal y seguridad</p>
            </header>

            {sanciones.length > 0 && (
                <div className="sancion-banner" style={{
                    backgroundColor: '#f8d7da', 
                    color: '#721c24', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    marginBottom: '25px',
                    borderLeft: '5px solid #dc3545',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                        ⚠️ Cuenta Sancionada
                    </h3>
                    <p>Actualmente tienes <strong>{sanciones.length} sanción(es) activa(s)</strong>. No podrás realizar nuevas solicitudes hasta que expiren.</p>
                    <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                        {sanciones.map(s => (
                            <li key={s.ID} style={{marginBottom: '5px'}}>
                                <strong>{s.penalizacion?.Descripcion}</strong> 
                                <br/>
                                <small>Vigente hasta: {new Date(s.Fecha_Fin).toLocaleDateString('es-CL')}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="perfil-grid">
                {/* Card de Información Personal */}
                <section className="perfil-card info-card">
                    {/* ... (contenido existente omitido para brevedad en el chunk, pero se mantiene todo) */}
                    <div className="card-header">
                        <span className="icon">👤</span>
                        <h2>Información Personal</h2>
                    </div>
                    <div className="card-body">
                        <div className="info-group">
                            <h3 className="group-title">Datos de Identidad</h3>
                            <div className="info-subgrid">
                                <div className="info-item">
                                    <label>Nombre Completo</label>
                                    <p>{user.nombreCompleto}</p>
                                </div>
                                <div className="info-item">
                                    <label>RUT</label>
                                    <p>{user.rut}</p>
                                </div>
                                <div className="info-item">
                                    <label>Correo Electrónico</label>
                                    <p>{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-group">
                            <h3 className="group-title">Vínculo Institucional</h3>
                            <div className="info-subgrid">
                                <div className="info-item">
                                    <label>Tipo de Usuario</label>
                                    <span className="badge-role">{userRole}</span>
                                </div>
                                {user.carrera && (
                                    <div className="info-item">
                                        <label>Carrera</label>
                                        <p>{user.carrera}</p>
                                    </div>
                                )}
                                {user.cargo && !esDirectorEscuela && (
                                    <div className="info-item">
                                        <label>Cargo</label>
                                        <p>{user.cargo}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Card de Seguridad (Cambio de Contraseña) */}
                <section className="perfil-card security-card">
                    <div className="card-header">
                        <span className="icon">🔒</span>
                        <h2>Seguridad</h2>
                    </div>
                    <div className="card-body">
                        <p className="section-desc">Actualiza tu contraseña para mantener tu cuenta segura.</p>
                        <form onSubmit={handleSubmitPassword} className="password-form">
                            <div className="form-group">
                                <label>Contraseña Actual</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Min. 8 caracteres"
                                />
                                <div className="password-requirements">
                                    <strong>Requisitos:</strong>
                                    <div className="requirements-list">
                                        <span className={passwords.newPassword.length >= 8 && passwords.newPassword.length <= 26 ? 'valid' : ''}>
                                            {passwords.newPassword.length >= 8 && passwords.newPassword.length <= 26 ? '✓' : '○'} 8-26 caracteres
                                        </span>
                                        <span className={/[A-Z]/.test(passwords.newPassword) ? 'valid' : ''}>
                                            {/[A-Z]/.test(passwords.newPassword) ? '✓' : '○'} Mayúscula
                                        </span>
                                        <span className={/[a-z]/.test(passwords.newPassword) ? 'valid' : ''}>
                                            {/[a-z]/.test(passwords.newPassword) ? '✓' : '○'} Minúscula
                                        </span>
                                        <span className={/[0-9]/.test(passwords.newPassword) ? 'valid' : ''}>
                                            {/[0-9]/.test(passwords.newPassword) ? '✓' : '○'} Número
                                        </span>
                                        <span className={/^[a-zA-Z0-9]*$/.test(passwords.newPassword) && passwords.newPassword.length > 0 ? 'valid' : ''}>
                                            {/^[a-zA-Z0-9]*$/.test(passwords.newPassword) && passwords.newPassword.length > 0 ? '✓' : '○'} Alfanumérico
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    placeholder="Repite la nueva contraseña"
                                />
                            </div>
                            <button type="submit" className="btn-update" disabled={loading}>
                                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Card de Soporte */}
                <section className="perfil-card soporte-card">
                    <div className="card-header">
                        <span className="icon">📧</span>
                        <h2>Ayuda y Soporte</h2>
                    </div>
                    <div className="card-body">
                        <p className="section-desc">¿Tienes alguna duda o problema técnico con el sistema?</p>
                        <div className="soporte-contacto">
                            <label>Correo de Contacto</label>
                            <a href="mailto:labespecialidades.face@ubiobio.cl" className="soporte-link">
                                labespecialidades.face@ubiobio.cl
                            </a>
                        </div>
                    </div>
                </section>

                {/* Card de Mis Solicitudes Recientes (Solo para Alumnos y Profesores) */}
                {userRole !== 'Administrador' && userRole !== 'Director de Escuela' && (
                    <section className="perfil-card solicitudes-card">
                        <div className="card-header">
                            <span className="icon">📋</span>
                            <h2>Mis Solicitudes Recientes</h2>
                            <Link to="/estado-solicitud" className="btn-view-all">Ver todas</Link>
                        </div>
                        <div className="card-body">
                            {loadingSolicitudes ? (
                                <p>Cargando solicitudes...</p>
                            ) : solicitudes.length === 0 ? (
                                <div className="no-solicitudes">
                                    <p>No has realizado solicitudes recientemente.</p>
                                    <Link to="/generar-solicitud" className="btn-primary-small">Generar nueva solicitud</Link>
                                </div>
                            ) : (
                                <div className="perfil-solicitudes-list">
                                    {solicitudes.map((sol) => {
                                        const isLargoPlazo = sol.Fecha_inicio_sol && sol.Fecha_termino_sol;
                                        const hasPrestamo = !!sol.ID_Prestamo;
                                        let estado = "Pendiente";
                                        let badgeClass = "badge-pendiente";

                                        if (hasPrestamo && sol.prestamo?.tieneEstados?.length > 0) {
                                            const lastEstado = [...sol.prestamo.tieneEstados].sort(
                                                (a, b) => new Date(b.Fecha_Estado) - new Date(a.Fecha_Estado)
                                            )[0];
                                            estado = lastEstado.estadoPrestamo?.Descripcion || "Procesando";
                                            
                                            const cod = lastEstado.Cod_Estado;
                                            if (cod === 2) badgeClass = "badge-aprobado";
                                            if (cod === 3) badgeClass = "badge-entregado";
                                            if (cod === 4) badgeClass = "badge-devuelto";
                                            if (cod === 5) badgeClass = "badge-rechazado";
                                        }

                                        return (
                                            <div key={sol.ID_Solicitud} className="perfil-solicitud-item">
                                                <div className="item-info">
                                                    <span className="item-date">{new Date(sol.Fecha_Sol).toLocaleDateString()}</span>
                                                    <span className="item-equipo">{sol.equipo?.categoria?.Descripcion} - {sol.ID_Num_Inv}</span>
                                                    {isLargoPlazo && <span className="item-tipo">📆 Largo Plazo</span>}
                                                </div>
                                                <span className={`item-status ${badgeClass}`}>{estado}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Perfil;
