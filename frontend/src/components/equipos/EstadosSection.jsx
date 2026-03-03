import { useState, useEffect } from 'react';
import { getEstados, deleteEstado } from '@services/catalogo.service';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@helpers/sweetAlert';
import Search from '@components/Search';
import CreateEstadoModal from './CreateEstadoModal';
import EditEstadoModal from './EditEstadoModal';

const EstadosSection = () => {
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState(null);

    useEffect(() => {
        fetchEstados();
    }, []);

    const fetchEstados = async () => {
        try {
            setLoading(true);
            const response = await getEstados();
            if (Array.isArray(response)) {
                setEstados(response);
            } else if (response.data && Array.isArray(response.data)) {
                setEstados(response.data);
            }
        } catch (error) {
            console.error('Error al cargar estados:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEstados = estados.filter((estado) =>
        searchText === '' || estado.Descripcion?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleCreateSuccess = () => {
        fetchEstados();
    };

    const handleEdit = (estado) => {
        setSelectedEstado(estado);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        fetchEstados();
    };

    const handleDelete = async (estado) => {
        const confirmed = await showConfirmAlert(
            `¿Eliminar estado "${estado.Descripcion}"?`,
            'Esta acción no se puede deshacer'
        );

        if (!confirmed) return;

        try {
            const response = await deleteEstado(estado.Cod_Estado);
            
            if (response.status === 'Success') {
                showSuccessAlert('Estado eliminado', 'El estado se ha eliminado correctamente');
                fetchEstados();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo eliminar el estado');
            }
        } catch (error) {
            console.error('Error al eliminar estado:', error);
            showErrorAlert('Error', 'Ocurrió un error al eliminar el estado');
        }
    };

    if (loading) return <div className="loading-message"><p>Cargando estados...</p></div>;

    return (
        <>
            <CreateEstadoModal 
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />

            <EditEstadoModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
                estado={selectedEstado}
            />

            <div className="section-header-with-button">
                <h2>Gestión de Estados <span className="count-badge">({filteredEstados.length})</span></h2>
                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    ➕ Crear Estado
                </button>
            </div>

            <div className="filters-section">
                <Search 
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar estado..."
                />
            </div>

            <div className="equipos-table-container">
                <table className="equipos-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEstados.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-data">No hay estados que mostrar</td>
                            </tr>
                        ) : (
                            filteredEstados.map((estado) => (
                                <tr key={estado.Cod_Estado}>
                                    <td>
                                        <span className="id-badge">{estado.Cod_Estado}</span>
                                    </td>
                                    <td>
                                        <div className="estado-name">
                                            <span className="estado-text">{estado.Descripcion}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions-buttons">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEdit(estado)}
                                                title="Editar estado"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(estado)}
                                                title="Eliminar estado"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default EstadosSection;
