import '@styles/styles.css';
import '@styles/gestion-equipos.css';
import { useState, useEffect } from 'react';
import { useGetEquipos } from '@hooks/equipos/useGetEquipos';

import { useGetEstados } from '@hooks/catalogos/useGetEstados'; // Importar hook
import MarcasSection from '@components/equipos/MarcasSection';
import CategoriasSection from '@components/equipos/CategoriasSection';
import EstadosSection from '@components/equipos/EstadosSection';
import CreateEquipoModal from '@components/equipos/CreateEquipoModal';
import EditEquipoModal from '@components/equipos/EditEquipoModal';
import EquipoDetailsModal from '@components/equipos/EquipoDetailsModal';
import { deleteEquipo } from '@services/equipo.service';
import '@styles/modal.css';
import '@styles/gestion-equipos.css';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '@helpers/sweetAlert.js';

const GestionEquipos = () => {
    const [activeTab, setActiveTab] = useState('equipos');
    const { equipos, loading, error, refetch } = useGetEquipos();
    const { estados: estadosCatalogo } = useGetEstados(); // Obtener estados completos

    // Estados de filtros
    const [searchText, setSearchText] = useState('');
    const [filterMarca, setFilterMarca] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterDisponible, setFilterDisponible] = useState('');

    // Modal states
    const [showCreateEquipoModal, setShowCreateEquipoModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);

    // Filtrar equipos según los filtros aplicados
    const filteredEquipos = equipos.filter((equipo) => {
        const matchesSearch = searchText === '' || 
            equipo.ID_Num_Inv?.toLowerCase().includes(searchText.toLowerCase()) ||
            equipo.Modelo?.toLowerCase().includes(searchText.toLowerCase()) ||
            equipo.Numero_Serie?.toLowerCase().includes(searchText.toLowerCase());

        const matchesMarca = filterMarca === '' || 
            equipo.marca?.Descripcion === filterMarca;

        const matchesCategoria = filterCategoria === '' || 
            equipo.categoria?.Descripcion === filterCategoria;

        const matchesEstado = filterEstado === '' || 
            equipo.estado?.Descripcion === filterEstado;

        const matchesDisponible = filterDisponible === '' || 
            (filterDisponible === 'Disponible' ? equipo.Disponible === true : equipo.Disponible === false);

        return matchesSearch && matchesMarca && matchesCategoria && matchesEstado && matchesDisponible;
    });

    // Refrescar equipos solo cuando se navega a la pestaña de equipos
    useEffect(() => {
        if (activeTab === 'equipos') {
            refetch();
        }
    }, [activeTab]);

    // Obtener valores únicos para los filtros
    const marcas = [...new Set(equipos.map(e => e.marca?.Descripcion).filter(Boolean))];
    const categorias = [...new Set(equipos.map(e => e.categoria?.Descripcion).filter(Boolean))];
    // Usar estados del catálogo completo
    const estados = estadosCatalogo.map(e => e.Descripcion);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, filterMarca, filterCategoria, filterEstado, filterDisponible]);

    // Calcular índices para paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEquipos = filteredEquipos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEquipos.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Renderizar tabs
    const renderTabContent = () => {
        switch (activeTab) {
            case 'equipos':
                return renderEquiposSection();
            case 'marcas':
                return <MarcasSection />;
            case 'categorias':
                return <CategoriasSection />;
            case 'estados':
                return <EstadosSection />;
            default:
                return renderEquiposSection();
        }
    };

    const handleCreateEquipoSuccess = () => {
        refetch();
    };

    const handleViewDetails = (equipo) => {
        setSelectedEquipo(equipo);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedEquipo(null);
    };

    const handleEdit = (equipo) => {
        setSelectedEquipo(equipo);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        refetch();
    };

    const handleDelete = async (equipo) => {
        const confirmed = await showConfirmAlert(
            `¿Eliminar equipo ${equipo.ID_Num_Inv}?`,
            'Esta acción eliminará permanentemente el equipo del sistema.'
        );

        if (!confirmed) return;

        try {
            const response = await deleteEquipo(equipo.ID_Num_Inv);
            if (response.status === 'Success') {
                showSuccessAlert('¡Eliminado!', 'El equipo ha sido eliminado correctamente.');
                refetch();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo eliminar el equipo');
            }
        } catch (error) {
            console.error('Error al eliminar equipo:', error);
            showErrorAlert('Error', 'Ocurrió un error al intentar eliminar el equipo');
        }
    };

    const renderEquiposSection = () => {
        if (loading) return <div className="loading-message"><p>Cargando equipos...</p></div>;
        if (error) return <div className="error-message"><p>{error}</p></div>;

        return (
            <>
                <CreateEquipoModal 
                    show={showCreateEquipoModal}
                    onClose={() => setShowCreateEquipoModal(false)}
                    onSuccess={handleCreateEquipoSuccess}
                />

                <div className="equipos-section">
                    <div className="section-header-with-button">
                        <h2>Gestión de Equipos</h2>
                        <button className="btn-create" onClick={() => setShowCreateEquipoModal(true)}>
                            ➕ Crear Equipo
                        </button>
                    </div>

                    <div className="filters-container">
                        <input 
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Buscar por N° Inv, Modelo o N° Serie..."
                            className="filter-input"
                        />

                        <select 
                            value={filterMarca}
                            onChange={(e) => setFilterMarca(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Todas las marcas</option>
                            {marcas.map((marca) => (
                                <option key={marca} value={marca}>{marca}</option>
                            ))}
                        </select>

                        <select 
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map((categoria) => (
                                <option key={categoria} value={categoria}>{categoria}</option>
                            ))}
                        </select>

                        <select 
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Todos los estados</option>
                            {estados.map((estado) => (
                                <option key={estado} value={estado}>{estado}</option>
                            ))}
                        </select>

                        <select 
                            value={filterDisponible}
                            onChange={(e) => setFilterDisponible(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Disponibilidad (Todos)</option>
                            <option value="Disponible">Disponible</option>
                            <option value="No Disponible">No Disponible</option>
                        </select>
                    </div>

                    <div className="equipos-table-container">
                        <table className="equipos-table">
                            <thead>
                                <tr>
                                    <th className="text-center">N° Inventario</th>
                                    <th className="text-center">N° Serie</th>
                                    <th className="text-center">Categoría</th>
                                    <th className="text-center">Marca</th>
                                    <th>Modelo</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center">Disponible</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEquipos.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="no-data">No hay equipos que mostrar</td>
                                    </tr>
                                ) : (
                                    currentEquipos.map((equipo) => (
                                        <tr key={equipo.ID_Num_Inv}>
                                            <td className="text-center">{equipo.ID_Num_Inv}</td>
                                            <td className="text-center">{equipo.Numero_Serie}</td>
                                            <td className="text-center">{equipo.categoria?.Descripcion || 'N/A'}</td>
                                            <td className="text-center">{equipo.marca?.Descripcion || 'N/A'}</td>
                                            <td>{equipo.Modelo}</td>
                                            <td className="text-center">{equipo.estado?.Descripcion || 'N/A'}</td>
                                            <td className="text-center">
                                                <span className={`disponible-badge ${equipo.Disponible ? 'disponible' : 'no-disponible'}`}>
                                                    {equipo.Disponible ? 'Sí' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions-buttons">
                                                    <button 
                                                        className="btn-details"
                                                        onClick={() => handleViewDetails(equipo)}
                                                        title="Ver detalles"
                                                    >
                                                        📄
                                                    </button>
                                                    <button 
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(equipo)}
                                                        title="Editar equipo"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(equipo)}
                                                        title="Eliminar equipo"
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

                    {/* Controles de Paginación - Ahora dentro del contenedor principal */}
                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button 
                                onClick={() => paginate(currentPage - 1)} 
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Anterior
                            </button>
                            
                            <span className="pagination-info">
                                Página {currentPage} de {totalPages}
                            </span>
                            
                            <button 
                                onClick={() => paginate(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>

                {showDetailsModal && (
                    <EquipoDetailsModal 
                        equipo={selectedEquipo}
                        onClose={handleCloseDetailsModal}
                    />
                )}

                {showEditModal && (
                    <EditEquipoModal
                        show={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={handleEditSuccess}
                        equipo={selectedEquipo}
                    />
                )}
            </>
        );
    };

    return (
        <div className="main-container">
            <div className="equipos-header">
                <h1>Gestión de Equipos</h1>
            </div>

            <div className="tabs-container">
                <button 
                    className={`tab-button ${activeTab === 'equipos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('equipos')}
                >
                    Equipos
                </button>
                <button 
                    className={`tab-button ${activeTab === 'marcas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('marcas')}
                >
                    Marcas
                </button>
                <button 
                    className={`tab-button ${activeTab === 'categorias' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categorias')}
                >
                    Categorías
                </button>
                <button 
                    className={`tab-button ${activeTab === 'estados' ? 'active' : ''}`}
                    onClick={() => setActiveTab('estados')}
                >
                    Estados
                </button>
            </div>

            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default GestionEquipos;
