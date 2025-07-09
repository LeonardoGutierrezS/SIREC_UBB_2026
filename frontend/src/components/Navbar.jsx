import { NavLink, useNavigate/*, useLocation */} from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    //const location = useLocation();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth'); 
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <>
            {/* Header superior */}
            <header className="top-header">
                <div className="header-content">
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>
                    <h1 className="app-title">Sistema de Gestión</h1>
                    <div className="user-info">
                        <span className="user-name">{user?.nombreCompleto || 'Usuario'}</span>
                        <span className="user-role">{user?.rol || ''}</span>
                    </div>
                </div>
            </header>

            {/* Overlay para móvil */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            {/* Sidebar lateral */}
            <nav className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-content">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Menú</h2>
                        <button className="sidebar-close" onClick={closeSidebar}>
                            ×
                        </button>
                    </div>

                    <ul className="sidebar-menu">
                        <li>
                            <NavLink 
                                to="/home" 
                                onClick={closeSidebar}
                                className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}
                            >
                                <span className="menu-icon">🏠</span>
                                <span className="menu-text">Inicio</span>
                            </NavLink>
                        </li>

                        {userRole === 'administrador' && (
                            <>
                                <li>
                                    <NavLink 
                                        to="/users" 
                                        onClick={closeSidebar}
                                        className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}
                                    >
                                        <span className="menu-icon">👥</span>
                                        <span className="menu-text">Usuarios</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/equipos" 
                                        onClick={closeSidebar}
                                        className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}
                                    >
                                        <span className="menu-icon">💻</span>
                                        <span className="menu-text">Equipos</span>
                                    </NavLink>
                                </li>
                            </>
                        )}

                        <li className="menu-divider"></li>

                        <li>
                            <button 
                                onClick={() => { 
                                    logoutSubmit(); 
                                    closeSidebar(); 
                                }}
                                className="menu-link logout-btn"
                            >
                                <span className="menu-icon">🚪</span>
                                <span className="menu-text">Cerrar sesión</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default Navbar;