import { useAuth } from '@context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, excludeDirectorEscuela = false }) => {
    const { isAuthenticated, user } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    if (allowedRoles) {
        // Si excludeDirectorEscuela es true, no permitir acceso a directores de escuela
        if (excludeDirectorEscuela && user?.esDirectorEscuela) {
            return <Navigate to="/home" />;
        }

        // Si el rol permitido es 'Director de Escuela', verificar el flag esDirectorEscuela
        const hasAccess = allowedRoles.some(role => {
            if (role === 'Director de Escuela') {
                return user?.esDirectorEscuela === true;
            }
            return user?.tipoUsuario === role;
        });

        if (!hasAccess) {
            return <Navigate to="/home" />;
        }
    }

    return children;
};

export default ProtectedRoute;
