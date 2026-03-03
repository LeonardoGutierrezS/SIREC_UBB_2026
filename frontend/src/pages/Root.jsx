import { Outlet } from 'react-router-dom';
import Navbar from '@components/Navbar';
import { AuthProvider } from '@context/AuthContext';

function Root()  {
return (
    <AuthProvider>
        <PageRoot/>
    </AuthProvider>
);
}

function PageRoot() {
return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
            <Outlet />
        </div>
    </div>
);
}

export default Root;