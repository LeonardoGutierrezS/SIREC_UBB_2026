import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState, useEffect } from "react";
import SirecLogo from '../Images/SIREC LOGO.png';
import FaceLogo from '../Images/Face_Blanco.png';
import { getSolicitudes } from '@services/solicitud.service';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const esDirectorEscuela = user?.esDirectorEscuela || false;
    const userRole = esDirectorEscuela ? 'Director de Escuela' : user?.tipoUsuario;
    const userName = user?.nombreCompleto || 'Usuario';
    const [menuOpen, setMenuOpen] = useState(false);
    const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);

    // Obtener solicitudes pendientes para el badge
    useEffect(() => {
        const fetchSolicitudesPendientes = async () => {
            if (userRole === 'Administrador' || esDirectorEscuela) {
                try {
                    const response = await getSolicitudes();
                    if (response.status === 'Success' && response.data) {
                        // Filtrar solo las pendientes (sin ID_Prestamo)
                        const pendientes = response.data.filter(s => !s.ID_Prestamo);
                        
                        // Si es director, solo largo plazo (fechas presentes y diferentes)
                        if (esDirectorEscuela) {
                            const largoPlazoPendientes = pendientes.filter(s => 
                                s.Fecha_inicio_sol && s.Fecha_termino_sol && s.Fecha_inicio_sol !== s.Fecha_termino_sol
                            );
                            setSolicitudesPendientes(largoPlazoPendientes.length);
                        } else {
                            // Si es admin, solo diarias (sin fechas O fechas iguales)
                            const diariasPendientes = pendientes.filter(s => 
                                !s.Fecha_inicio_sol || !s.Fecha_termino_sol || s.Fecha_inicio_sol === s.Fecha_termino_sol
                            );
                            setSolicitudesPendientes(diariasPendientes.length);
                        }
                    }
                } catch (error) {
                    console.error('Error al obtener solicitudes pendientes:', error);
                }
            }
        };

        fetchSolicitudesPendientes();
        
        // Actualizar cada 60 segundos
        const interval = setInterval(fetchSolicitudesPendientes, 60000);
        
        return () => clearInterval(interval);
    }, [userRole, esDirectorEscuela]);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth'); 
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <>
            <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src={SirecLogo} alt="SIREC" className="sidebar-logo" />
                    <div className="user-info">
                        <p className="user-name">{userName}</p>
                        <p className="user-role">{userRole}</p>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink 
                                to="/home" 
                                className={({ isActive }) => isActive ? 'active' : ''}
                                onClick={() => setMenuOpen(false)}
                            >
                                <span className="icon">🏠</span>
                                <span className="text">Inicio</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/perfil" 
                                className={({ isActive }) => isActive ? 'active' : ''}
                                onClick={() => setMenuOpen(false)}
                            >
                                <span className="icon">👤</span>
                                <span className="text">Mi Perfil</span>
                            </NavLink>
                        </li>
                        
                        {userRole === 'Administrador' && (
                            <>
                                <li>
                                    <NavLink 
                                        to="/gestion-usuarios" 
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span className="icon">👥</span>
                                        <span className="text">Gestión de Usuarios</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/gestion-equipos" 
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span className="icon">💻</span>
                                        <span className="text">Gestión de Equipos</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/gestion-solicitudes" 
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span className="icon">📋</span>
                                        <span className="text">
                                            Gestión de Solicitudes
                                            {solicitudesPendientes > 0 && (
                                                <span className="badge-count">{solicitudesPendientes}</span>
                                            )}
                                        </span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/gestion-penalizaciones" 
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span className="icon">⚠️</span>
                                        <span className="text">Gestión de Penalizaciones</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/reportes" 
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span className="icon">📊</span>
                                        <span className="text">Reportes</span>
                                    </NavLink>
                                </li>
                            </>
                        )}
                        
                        {esDirectorEscuela && (
                            <li>
                                <NavLink 
                                    to="/gestion-solicitudes" 
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="icon">📋</span>
                                    <span className="text">
                                        Gestión de Solicitudes
                                        {solicitudesPendientes > 0 && (
                                            <span className="badge-count">{solicitudesPendientes}</span>
                                        )}
                                    </span>
                                </NavLink>
                            </li>
                        )}
                        
                        {(userRole === 'Alumno' || (userRole === 'Profesor' && !esDirectorEscuela)) && (
                            <>
                                <li>
                                    <NavLink 
                                        to="/generar-solicitud" 
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span className="icon">➕</span>
                                        <span className="text">Generar Solicitud</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/estado-solicitud" 
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <span className="icon">📊</span>
                                        <span className="text">Estado de Solicitud</span>
                                    </NavLink>
                                </li>
                            </>
                        )}
                        

                        
                        <li className="logout">
                            <a onClick={logoutSubmit}>
                                <span className="icon">🚪</span>
                                <span className="text">Cerrar sesión</span>
                            </a>
                        </li>
                    </ul>

                    {/* Footer con Logo FACE */}
                    <div className="sidebar-footer-logo">
                        <img src={FaceLogo} alt="Facultad de Ciencias Empresariales" />
                    </div>
                </nav>
            </div>

            <div className="hamburger" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>

            {menuOpen && <div className="overlay" onClick={toggleMenu}></div>}
        </>
    );
};

export default Navbar;