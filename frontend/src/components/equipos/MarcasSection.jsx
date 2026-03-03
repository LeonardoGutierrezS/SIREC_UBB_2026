import { useState, useEffect } from 'react';
import { getMarcas, deleteMarca } from '@services/catalogo.service';
import Search from '@components/Search';
import CreateMarcaModal from './CreateMarcaModal';
import EditMarcaModal from './EditMarcaModal';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '@helpers/sweetAlert.js';

const MarcasSection = () => {
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMarca, setSelectedMarca] = useState(null);

    useEffect(() => {
        fetchMarcas();
    }, []);

    const fetchMarcas = async () => {
        try {
            setLoading(true);
            const response = await getMarcas();
            if (Array.isArray(response)) {
                setMarcas(response);
            } else if (response.data && Array.isArray(response.data)) {
                setMarcas(response.data);
            }
        } catch (error) {
            console.error('Error al cargar marcas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMarcas = marcas.filter((marca) =>
        searchText === '' || marca.Descripcion?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleCreateSuccess = () => {
        fetchMarcas();
    };

    const handleEdit = (marca) => {
        setSelectedMarca(marca);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        fetchMarcas();
        setSelectedMarca(null);
    };

    const handleCloseEdit = () => {
        setShowEditModal(false);
        setSelectedMarca(null);
    };

    const handleDelete = async (marca) => {
        const result = await showConfirmAlert(
            '¿Eliminar marca?',
            `¿Estás seguro de que deseas eliminar la marca "${marca.Descripcion}"? Esta acción no se puede deshacer.`
        );

        if (result.isConfirmed) {
            try {
                const response = await deleteMarca(marca.ID_Marca);
                
                if (response.status === 'Success') {
                    showSuccessAlert('¡Marca eliminada!', 'La marca ha sido eliminada exitosamente.');
                    fetchMarcas();
                } else {
                    showErrorAlert('Error', response.message || 'No se pudo eliminar la marca');
                }
            } catch (error) {
                console.error('Error al eliminar marca:', error);
                showErrorAlert('Error', 'Ocurrió un error al eliminar la marca');
            }
        }
    };

    if (loading) return <div className="loading-message"><p>Cargando marcas...</p></div>;

    return (
        <>
            <CreateMarcaModal 
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />

            <EditMarcaModal
                show={showEditModal}
                onClose={handleCloseEdit}
                onSuccess={handleEditSuccess}
                marca={selectedMarca}
            />

            <div className="section-header-with-button">
                <h2>Gestión de Marcas <span className="count-badge">({filteredMarcas.length})</span></h2>
                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    ➕ Crear Marca
                </button>
            </div>

            <div className="filters-section">
                <Search 
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar marca..."
                />
            </div>

            <div className="equipos-table-container">
                <table className="equipos-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Marca</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMarcas.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-data">No hay marcas que mostrar</td>
                            </tr>
                        ) : (
                            filteredMarcas.map((marca) => (
                                <tr key={marca.ID_Marca}>
                                    <td>
                                        <span className="id-badge">{marca.ID_Marca}</span>
                                    </td>
                                    <td>
                                        <div className="marca-name">
                                            <span className="marca-icon">🏷️</span>
                                            <span className="marca-text">{marca.Descripcion}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions-buttons">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEdit(marca)}
                                                title="Editar marca"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(marca)}
                                                title="Eliminar marca"
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

export default MarcasSection;
