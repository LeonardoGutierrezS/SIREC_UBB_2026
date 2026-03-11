import { useState } from 'react';
import usePendingUsers from '@hooks/users/usePendingUsers.jsx';
import useAllUsers from '@hooks/users/useAllUsers.jsx';
import CreateUserModal from '@components/CreateUserModal.jsx';
import EditUserModal from '@components/EditUserModal.jsx';
import '@styles/styles.css';
import '@styles/gestion-usuarios.css';

const GestionUsuarios = () => {
    const [activeTab, setActiveTab] = useState('all'); // 'pending' o 'all' - default 'all'

    return (
        <div className="main-container">
            <h1>Gestión de Usuarios</h1>
            
            <div className="tabs-container">
                <button 
                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    📋 Solicitudes Pendientes
                </button>
                <button 
                    className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    👥 Todos los Usuarios
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'pending' ? (
                    <PendingUsersSection />
                ) : (
                    <AllUsersSection />
                )}
            </div>
        </div>
    );
};

// Sección de usuarios pendientes
const PendingUsersSection = () => {
    const { pendingUsers, loading, handleApprove, handleReject } = usePendingUsers();

    if (loading) {
        return <div className="loading">Cargando usuarios pendientes...</div>;
    }

    if (pendingUsers.length === 0) {
        return (
            <div className="pending-users-section">
                <h2>Usuarios Pendientes de Aprobación</h2>
                <p className="no-data">No hay usuarios pendientes de aprobación</p>
            </div>
        );
    }

    return (
        <div className="pending-users-section">
            <h2>Usuarios Pendientes de Aprobación ({pendingUsers.length})</h2>
            {pendingUsers.map(user => {
                const tipoUsuarioDesc = user.tipoUsuario?.Descripcion || '';
                const codTipoUsuario = user.tipoUsuario?.Cod_TipoUsuario;
                
                // Determinar qué mostrar según el tipo de usuario
                let carreraOCargoLabel = 'Carrera';
                let carreraOCargoValue = '-';
                
                if (codTipoUsuario === 2) {
                    // Alumno - mostrar carrera
                    carreraOCargoLabel = 'Carrera';
                    carreraOCargoValue = user.carrera?.Nombre_Carrera || 'Sin carrera';
                } else if (codTipoUsuario === 3) {
                    // Profesor - mostrar cargo con descripción si aplica
                    carreraOCargoLabel = 'Cargo';
                    const descCargo = user.cargo?.Desc_Cargo || 'Sin cargo';
                    const descripcionPersonalizada = user.poseesCargos?.[0]?.Descripcion_Cargo;
                    
                    if (descCargo === 'Otro' && descripcionPersonalizada) {
                        carreraOCargoValue = `${descCargo} (${descripcionPersonalizada})`;
                    } else {
                        carreraOCargoValue = descCargo;
                    }
                }
                
                return (
                    <div key={user.ID_Usuario} className="pending-user-card">
                        <div className="user-info-row">
                            <div className="info-item">
                                <span className="info-label">Nombre Completo</span>
                                <span className="info-value">{user.Nombre_Completo}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Correo</span>
                                <span className="info-value">{user.Correo}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">RUT</span>
                                <span className="info-value">{user.Rut}</span>
                            </div>
                            {carreraOCargoValue !== '-' && (
                                <div className="info-item">
                                    <span className="info-label">{carreraOCargoLabel}</span>
                                    <span className="info-value">{carreraOCargoValue}</span>
                                </div>
                            )}
                        </div>
                        <div className="action-buttons">
                            <button 
                                className="btn-approve"
                                onClick={() => handleApprove(user.Rut)}
                            >
                                ✓ Aprobar
                            </button>
                            <button 
                                className="btn-reject"
                                onClick={() => handleReject(user.Rut)}
                            >
                                ✗ Rechazar
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Sección de todos los usuarios
const AllUsersSection = () => {
    const { users, loading, filters, setFilters, handleDeactivate, fetchAllUsers } = useAllUsers();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setSelectedUser(null);
        // Recargar la lista de usuarios sin recargar la página completa
        fetchAllUsers();
    };

    if (loading) {
        return <div className="loading">Cargando usuarios...</div>;
    }

    return (
        <div className="all-users-section">
            <div className="section-header">
                <h2>Lista de Usuarios ({users.length})</h2>
                <button 
                    className="btn-create-user"
                    onClick={() => setShowCreateModal(true)}
                >
                    ➕ Crear Usuario
                </button>
            </div>

            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o RUT..."
                    className="filter-input"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <select
                    className="filter-select"
                    value={filters.tipoUsuario}
                    onChange={(e) => setFilters({ ...filters, tipoUsuario: e.target.value })}
                >
                    <option value="">Todos los tipos de usuario</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Alumno">Alumno</option>
                    <option value="Profesor">Profesor</option>
                </select>
                <select
                    className="filter-select"
                    value={filters.vigente}
                    onChange={(e) => setFilters({ ...filters, vigente: e.target.value })}
                >
                    <option value="">Todos los estados</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                </select>
            </div>

            {users.length === 0 ? (
                <p className="no-data">No se encontraron usuarios</p>
            ) : (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>RUT</th>
                            <th>Tipo de Usuario</th>
                            <th>Carrera/Cargo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const tipoUsuarioDesc = user.tipoUsuario?.Descripcion || '';
                            const codTipoUsuario = user.tipoUsuario?.Cod_TipoUsuario;
                            
                            // Determinar qué mostrar según el tipo de usuario
                            let carreraOCargo = '-';
                            if (codTipoUsuario === 2) {
                                // Alumno - mostrar carrera
                                carreraOCargo = user.carrera?.Nombre_Carrera || 'Sin carrera';
                            } else if (codTipoUsuario === 3) {
                                // Profesor - mostrar cargo con descripción si aplica
                                const descCargo = user.cargo?.Desc_Cargo || 'Sin cargo';
                                const descripcionPersonalizada = user.poseesCargos?.[0]?.Descripcion_Cargo;
                                
                                if (descCargo === 'Otro' && descripcionPersonalizada) {
                                    carreraOCargo = `${descCargo} (${descripcionPersonalizada})`;
                                } else {
                                    carreraOCargo = descCargo;
                                }
                            }
                            
                            return (
                                <tr key={user.Rut || user.ID_Usuario}>
                                    <td>{user.Nombre_Completo}</td>
                                    <td>{user.Correo}</td>
                                    <td>{user.Rut}</td>
                                    <td>{tipoUsuarioDesc || 'N/A'}</td>
                                    <td>{carreraOCargo}</td>
                                    <td>
                                        <span className={`status-badge ${user.Vigente ? 'active' : 'inactive'}`}>
                                            {user.Vigente ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button 
                                                className={user.Vigente ? 'btn-deactivate' : 'btn-approve'}
                                                onClick={() => handleDeactivate(user.Rut, user.Vigente)}
                                            >
                                                {user.Vigente ? '⊗ Desactivar' : '✓ Activar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {showCreateModal && (
                <CreateUserModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchAllUsers(); // Fetch sin recargar página
                    }}
                />
            )}

            {showEditModal && selectedUser && (
                <EditUserModal 
                    user={selectedUser}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default GestionUsuarios;
