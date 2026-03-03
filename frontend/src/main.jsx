import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import Register from '@pages/Register';
import RecoverPassword from '@pages/RecoverPassword';
import ResetPassword from '@pages/ResetPassword';
import GestionUsuarios from '@pages/GestionUsuarios';
import GestionEquipos from '@pages/GestionEquipos';
import GestionSolicitudes from '@pages/GestionSolicitudes';
import GestionPenalizaciones from '@pages/GestionPenalizaciones';
import Reportes from '@pages/Reportes';
import GenerarSolicitud from '@pages/GenerarSolicitud';
import EstadoSolicitud from '@pages/EstadoSolicitud';
import Error404 from '@pages/Error404';
import Perfil from '@pages/Perfil';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        path: '/home',
        element: <Home/>
      },
      {
        path: '/users',
        element: (
        <ProtectedRoute allowedRoles={['Administrador']}>
          <Users />
        </ProtectedRoute>
        ),
      },
      {
        path: '/gestion-usuarios',
        element: (
        <ProtectedRoute allowedRoles={['Administrador']}>
          <GestionUsuarios />
        </ProtectedRoute>
        ),
      },
      {
        path: '/gestion-equipos',
        element: (
        <ProtectedRoute allowedRoles={['Administrador']}>
          <GestionEquipos />
        </ProtectedRoute>
        ),
      },
      {
        path: '/gestion-solicitudes',
        element: (
        <ProtectedRoute allowedRoles={['Administrador', 'Director de Escuela']}>
          <GestionSolicitudes />
        </ProtectedRoute>
        ),
      },
      {
        path: '/gestion-penalizaciones',
        element: (
        <ProtectedRoute allowedRoles={['Administrador']}>
          <GestionPenalizaciones />
        </ProtectedRoute>
        ),
      },
      {
        path: '/reportes',
        element: (
        <ProtectedRoute allowedRoles={['Administrador']}>
          <Reportes />
        </ProtectedRoute>
        ),
      },
      {
        path: '/generar-solicitud',
        element: (
        <ProtectedRoute allowedRoles={['Alumno', 'Profesor']} excludeDirectorEscuela={true}>
          <GenerarSolicitud />
        </ProtectedRoute>
        ),
      },
      {
        path: '/estado-solicitud',
        element: (
        <ProtectedRoute allowedRoles={['Alumno', 'Profesor']} excludeDirectorEscuela={true}>
          <EstadoSolicitud />
        </ProtectedRoute>
        ),
      },
      {
        path: '/perfil',
        element: <Perfil />
      }
    ]
  },
  {
    path: '/auth',
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  },
  {
    path: '/recover-password',
    element: <RecoverPassword/>
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
)