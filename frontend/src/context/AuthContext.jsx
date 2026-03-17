import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('usuario')) || '';
    const isAuthenticated = user ? true : false;

useEffect(() => {
    if (!isAuthenticated) {
        navigate('/auth');
    }
}, [isAuthenticated, navigate]);

useEffect(() => {
    // Sincronizar sesión entre pestañas: Si cambia el localStorage en otra pestaña, se refresca
    const syncSession = (e) => {
        if (e.key === 'usuario') {
            if (!e.newValue) {
                // Se cerró la sesión en otra pestaña
                navigate('/auth');
            } else {
                // Alguien inició sesión en otra pestaña
                window.location.reload();
            }
        }
    };
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
}, [navigate]);

return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
        {children}
    </AuthContext.Provider>
);
}