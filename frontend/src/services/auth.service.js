import axios from './root.service.js';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { convertirMinusculas } from '@helpers/formatData.js';

export async function login(dataUser) {
    try {
        const response = await axios.post('/auth/login', {
            email: dataUser.email, 
            password: dataUser.password
        });
        const { status, data } = response;
        if (status === 200) {
            const decodedToken = jwtDecode(data.data.token);
            const { rut, nombreCompleto, email, tipoUsuario, cargo, esDirectorEscuela, carrera, vigente } = decodedToken;
            const userData = { 
                rut,
                nombreCompleto, 
                email, 
                tipoUsuario: tipoUsuario || 'Alumno',
                cargo,
                esDirectorEscuela: esDirectorEscuela || false,
                carrera,
                vigente
            };
            sessionStorage.setItem('usuario', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
            cookies.set('jwt-auth', data.data.token, {path:'/'});
            return response.data;
        }
    } catch (error) {
        return error.response.data;
    }
}

export async function register(data) {
    try {
        const { nombreCompleto, email, rut, password, tipoUsuario, carreraId, cargo } = data;
        
        const requestData = {
            nombreCompleto,
            email: email.toLowerCase(), // Solo el email en minúsculas
            rut,
            password,
            tipoUsuario
        };

        // Agregar carreraId solo si es Alumno
        if (tipoUsuario === 'Alumno' && carreraId) {
            requestData.carreraId = parseInt(carreraId);
        }

        // Agregar cargo solo si es Profesor
        if (tipoUsuario === 'Profesor' && cargo) {
            requestData.cargo = cargo;
        }

        const response = await axios.post('/auth/register', requestData);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function logout() {
    try {
        await axios.post('/auth/logout');
        sessionStorage.removeItem('usuario');
        cookies.remove('jwt');
        cookies.remove('jwt-auth');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

export async function forgotPassword(email) {
    try {
        const response = await axios.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al procesar solicitud' };
    }
}

export async function validateResetToken(token) {
    try {
        const response = await axios.get(`/auth/validate-reset-token?token=${token}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Token inválido' };
    }
}

export async function resetPassword(token, password, confirmPassword) {
    try {
        const response = await axios.post('/auth/reset-password', {
            token,
            password,
            confirmPassword
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al actualizar contraseña' };
    }
}
