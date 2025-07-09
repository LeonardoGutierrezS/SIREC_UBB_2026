import { useCallback, useState } from 'react';
import Table from '@components/Table';
import useEquipos from '@hooks/equipos/useGetEquipos.jsx';
import usePDFEquipos from '@hooks/equipos/usePDFEquipos.jsx'; // <-- Agregar
import Search from '../components/Search';
import Popup from '../components/Popup';
import EquipoForm from '../components/EquipoForm.jsx';
import DeleteIcon from '../assets/deleteIcon.svg';
import UpdateIcon from '../assets/updateIcon.svg';
import UpdateIconDisable from '../assets/updateIconDisabled.svg';
import DeleteIconDisable from '../assets/deleteIconDisabled.svg';
import '@styles/equipos.css';
import useEditEquipo from '@hooks/equipos/useEditEquipos.jsx';
import useDeleteEquipo from '@hooks/equipos/useDeleteEquipos.jsx';
import { createEquipo } from '@services/equipos.service.js';

const Equipos = () => {
  const { equipos, fetchEquipos, setEquipos } = useEquipos();
  const { handleDownloadPDF, handlePreviewPDF } = usePDFEquipos(); // <-- Agregar
  const [filterModelo, setFilterModelo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataEquipo,
    setDataEquipo
  } = useEditEquipo(setEquipos);

  const { handleDelete } = useDeleteEquipo(fetchEquipos, setDataEquipo);

  const handleModeloFilterChange = (e) => {
    setFilterModelo(e.target.value);
  };

  const handleSelectionChange = useCallback((selectedEquipos) => {
    setDataEquipo(selectedEquipos);
  }, [setDataEquipo]);

  const handleOpenForm = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  const handleCreateEquipo = async (formData) => {
    setLoading(true);
    await createEquipo(formData);
    setLoading(false);
    setShowForm(false);
    fetchEquipos();
  };

  const columns = [
    { title: "Modelo", field: "Modelo", width: 200, responsive: 0 },
    { title: "Tipo", field: "Tipo", width: 150, responsive: 1 },
    { title: "Estado", field: "ID_Estado", width: 120, responsive: 2 },
    { title: "Condición", field: "Condicion", width: 120, responsive: 2 },
    { title: "Propietario", field: "Propietario", width: 200, responsive: 2 },
    { title: "Fecha Alta", field: "Fecha_Alta_LAB", width: 150, responsive: 2 }
  ];

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Equipos</h1>
          <div className='filter-actions'>
            <Search value={filterModelo} onChange={handleModeloFilterChange} placeholder={'Filtrar por modelo'} />
            
            {/* Botones PDF */}
            <button onClick={handlePreviewPDF} className="pdf-preview-button">
              Vista previa PDF
            </button>
            <button onClick={handleDownloadPDF} className="pdf-download-button">
              Descargar PDF
            </button>
            
            <button onClick={handleOpenForm} className="new-equipo-button">
              Ingresar nuevo equipo
            </button>
            <button onClick={handleClickUpdate} disabled={dataEquipo.length === 0}>
              {dataEquipo.length === 0 ? (
                <img src={UpdateIconDisable} alt="edit-disabled" />
              ) : (
                <img src={UpdateIcon} alt="edit" />
              )}
            </button>
            <button className='delete-equipo-button' disabled={dataEquipo.length === 0} onClick={() => handleDelete(dataEquipo)}>
              {dataEquipo.length === 0 ? (
                <img src={DeleteIconDisable} alt="delete-disabled" />
              ) : (
                <img src={DeleteIcon} alt="delete" />
              )}
            </button>
          </div>
        </div>
        <Table
          data={equipos}
          columns={columns}
          filter={filterModelo}
          dataToFilter={'Modelo'}
          initialSortName={'Modelo'}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataEquipo} action={handleUpdate} />
      {showForm && (
        <EquipoForm
          onSubmit={handleCreateEquipo}
          onClose={handleCloseForm}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Equipos;