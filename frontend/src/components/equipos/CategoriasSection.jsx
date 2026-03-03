import { useState, useEffect } from 'react';
import { getCategorias, deleteCategoria } from '@services/catalogo.service';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert';
import { showConfirmAlert } from '@helpers/sweetAlert';
import Search from '@components/Search';
import CreateCategoriaModal from './CreateCategoriaModal';
import EditCategoriaModal from './EditCategoriaModal';

const CategoriasSection = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);

    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const response = await getCategorias();
            if (Array.isArray(response)) {
                setCategorias(response);
            } else if (response.data && Array.isArray(response.data)) {
                setCategorias(response.data);
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategorias = categorias.filter((categoria) =>
        searchText === '' || categoria.Descripcion?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleCreateSuccess = () => {
        fetchCategorias();
    };

    const handleEdit = (categoria) => {
        setSelectedCategoria(categoria);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        fetchCategorias();
    };

    const handleDelete = async (categoria) => {
        const confirmed = await showConfirmAlert(
            `¿Eliminar categoría "${categoria.Descripcion}"?`,
            'Esta acción no se puede deshacer'
        );

        if (!confirmed) return;

        try {
            const response = await deleteCategoria(categoria.ID_Categoria);
            
            if (response.status === 'Success') {
                showSuccessAlert('Categoría eliminada', 'La categoría se ha eliminado correctamente');
                fetchCategorias();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo eliminar la categoría');
            }
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            showErrorAlert('Error', 'Ocurrió un error al eliminar la categoría');
        }
    };

    if (loading) return <div className="loading-message"><p>Cargando categorías...</p></div>;

    return (
        <>
            <CreateCategoriaModal 
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />

            <EditCategoriaModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
                categoria={selectedCategoria}
            />

            <div className="section-header-with-button">
                <h2>Gestión de Categorías <span className="count-badge">({filteredCategorias.length})</span></h2>
                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    ➕ Crear Categoría
                </button>
            </div>

            <div className="filters-section">
                <Search 
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Buscar categoría..."
                />
            </div>

            <div className="equipos-table-container">
                <table className="equipos-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategorias.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-data">No hay categorías que mostrar</td>
                            </tr>
                        ) : (
                            filteredCategorias.map((categoria) => (
                                <tr key={categoria.ID_Categoria}>
                                    <td>
                                        <span className="id-badge">{categoria.ID_Categoria}</span>
                                    </td>
                                    <td>
                                        <div className="categoria-name">
                                            <span className="categoria-text">{categoria.Descripcion}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions-buttons">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEdit(categoria)}
                                                title="Editar categoría"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(categoria)}
                                                title="Eliminar categoría"
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

export default CategoriasSection;
