import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle,
  faCalendarAlt,
  faUserShield,
  faGraduationCap,
  faChalkboardTeacher,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';

import '@styles/Home.css';

const Home = () => {
    const user = JSON.parse(localStorage.getItem('usuario')) || {};
    const userName = user?.nombreCompleto || 'Usuario';
    const esDirectorEscuela = user?.esDirectorEscuela || false;
    const tipoUsuario = user?.tipoUsuario || 'Sin tipo de usuario';
    const userRole = esDirectorEscuela ? (user?.cargo || 'Director de Escuela') : tipoUsuario;


    // Determinar icono y color según rol
    const getRoleConfig = () => {
        if (esDirectorEscuela) return { icon: faBuilding, color: '#ffffff', bg: 'rgba(139, 92, 246, 0.85)', label: userRole };
        switch (tipoUsuario) {
            case 'Administrador': return { icon: faUserShield, color: '#ffffff', bg: 'rgba(239, 68, 68, 0.85)', label: 'Administrador' };
            case 'Profesor': return { icon: faChalkboardTeacher, color: '#ffffff', bg: 'rgba(245, 158, 11, 0.85)', label: 'Profesor' };
            case 'Alumno': return { icon: faGraduationCap, color: '#ffffff', bg: 'rgba(59, 130, 246, 0.85)', label: 'Alumno' };
            default: return { icon: faGraduationCap, color: '#ffffff', bg: 'rgba(107, 114, 128, 0.85)', label: userRole };
        }
    };

    const roleConfig = getRoleConfig();

    // Obtener saludo según hora del día
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 19) return 'Buenas tardes';
        return 'Buenas noches';
    };

    return (
        <div className="main-container">
            {/* Banner Marcha Blanca */}
            <div className="home-banner-marcha-blanca">
                <div className="home-banner-icon">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <div className="home-banner-content">
                    <h3>Periodo de Marcha Blanca</h3>
                    <p>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '6px' }} />
                        Del <strong>6 de abril</strong> al <strong>6 de mayo de 2026</strong>
                    </p>
                    <p className="home-banner-sub">
                        Durante este periodo el sistema se encuentra en fase de pruebas. 
                        Agradecemos su paciencia y colaboración para reportar cualquier inconveniente
                        al correo <a href="mailto:labespecialidades.face@ubiobio.cl" style={{ color: '#92400e', fontWeight: '600' }}>labespecialidades.face@ubiobio.cl</a>.
                    </p>
                </div>
            </div>

            {/* Hero de Bienvenida */}
            <div className="home-hero">
                <div className="home-hero-text">
                    <p className="home-greeting">{getGreeting()},</p>
                    <h1 className="home-username">{userName}</h1>
                    <div className="home-role-badge" style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}>
                        <FontAwesomeIcon icon={roleConfig.icon} />
                        <span>{roleConfig.label}</span>
                    </div>
                </div>
                <div className="home-hero-graphic">
                    <div className="home-hero-circle">
                        <span className="home-hero-emoji">🖥️</span>
                    </div>
                </div>
            </div>

            {/* Descripción del sistema */}
            <div className="home-description">
                <h2>Sistema de Registro y Control de Equipos Computacionales</h2>
                <p>
                    Plataforma integral de la <strong>Universidad del Bío-Bío</strong> para la gestión 
                    de solicitudes, préstamos y control de equipos computacionales del laboratorio de especialidades.
                </p>
            </div>


        </div>
    );
};

export default Home;
