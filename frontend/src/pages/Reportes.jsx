import '@styles/styles.css';
import '@styles/gestion-solicitudes.css';
import '@styles/DashboardStats.css';
import { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale/es';
import { format } from 'date-fns';
registerLocale('es', es);

import { 
  descargarReporteSolicitudesPDF,
  descargarReporteSolicitudesCSV,
  descargarReportePrestamosPDF,
  descargarReportePrestamosCSV,
  descargarReporteEquiposPDF,
  descargarReporteEquiposCSV,
  descargarReporteEstadisticasPDF,
  descargarReporteUsuariosPDF,
  descargarReporteUsuariosCSV,
  obtenerDatosGraficos
} from '@services/reportes.service';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileCsv, faCalendar, faDownload, faChartBar, faEye, faUsers, faClipboardList, faBoxOpen, faLaptop, faGraduationCap, faTags } from '@fortawesome/free-solid-svg-icons';
import GraficosReportes from '@components/GraficosReportes';
import { useGetCarreras } from '@hooks/catalogos/useGetCarreras';
import { useGetCategorias } from '@hooks/catalogos/useGetCategorias';

const Reportes = () => {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [fechaFin, setFechaFin] = useState(new Date());
  const [tipoUsuarioFiltro, setTipoUsuarioFiltro] = useState('');
  const [carreraFiltro, setCarreraFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [tipoUsuarioSolFiltro, setTipoUsuarioSolFiltro] = useState('');
  const [cargoSolFiltro, setCargoSolFiltro] = useState('');
  const [rutPrestamoFiltro, setRutPrestamoFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [datosGraficos, setDatosGraficos] = useState(null);
  const [mesesHistorial, setMesesHistorial] = useState(6);

  const { carreras } = useGetCarreras();
  const { categorias } = useGetCategorias();

  // Cargar datos de gráficos al montar o cuando cambie el historial
  useEffect(() => {
    cargarDatosGraficos();
  }, [mesesHistorial]);

  useEffect(() => {
    if (datosGraficos && datosGraficos.solicitudesPorMes && datosGraficos.solicitudesPorMes.length > 0) {
      const primeraFechaStr = datosGraficos.solicitudesPorMes[0].mes;
      if (primeraFechaStr) {
        setFechaInicio(new Date(primeraFechaStr));
      }
    } else if (!fechaInicio) {
        setFechaInicio(new Date(new Date().getFullYear(), 0, 1));
    }
  }, [datosGraficos]);

  const cargarDatosGraficos = async () => {
    try {
      const filtros = {
        meses: mesesHistorial,
        fechaInicio: formatFecha(fechaInicio),
        fechaFin: formatFecha(fechaFin),
        carrera: carreraFiltro,
        categoria: categoriaFiltro
      };
      const datos = await obtenerDatosGraficos(filtros);
      setDatosGraficos(datos);
    } catch {
      console.error('Error al cargar datos de gráficos');
    }
  };

  // Función auxiliar para descargar archivo
  const descargarArchivo = (blob, nombreArchivo) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Función para previsualizar PDF en nueva pestaña
  const previsualizarPDF = (blob) => {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  // Helper para formatear fechas para la API (YYYY-MM-DD)
  const formatFecha = (date) => (date ? format(date, 'yyyy-MM-dd') : '');

  // Handlers para Solicitudes
  const handlePrevisualizarSolicitudesPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteSolicitudesPDF(formatFecha(fechaInicio), formatFecha(fechaFin), tipoUsuarioSolFiltro, cargoSolFiltro);
      previsualizarPDF(blob);
      showSuccessAlert('Vista previa abierta', 'El reporte se ha abierto en una nueva pestaña');
    } catch {
      showErrorAlert('Error', 'No se pudo previsualizar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarSolicitudesPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteSolicitudesPDF(formatFecha(fechaInicio), formatFecha(fechaFin), tipoUsuarioSolFiltro, cargoSolFiltro);
      descargarArchivo(blob, `reporte-solicitudes-${Date.now()}.pdf`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarSolicitudesCSV = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteSolicitudesCSV(formatFecha(fechaInicio), formatFecha(fechaFin), tipoUsuarioSolFiltro, cargoSolFiltro);
      descargarArchivo(blob, `reporte-solicitudes-${Date.now()}.csv`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Préstamos
  const handlePrevisualizarPrestamosPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReportePrestamosPDF(formatFecha(fechaInicio), formatFecha(fechaFin), tipoUsuarioSolFiltro, rutPrestamoFiltro);
      previsualizarPDF(blob);
      showSuccessAlert('Vista previa abierta', 'El reporte se ha abierto en una nueva pestaña');
    } catch {
      showErrorAlert('Error', 'No se pudo previsualizar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPrestamosPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReportePrestamosPDF(formatFecha(fechaInicio), formatFecha(fechaFin), tipoUsuarioSolFiltro, rutPrestamoFiltro);
      descargarArchivo(blob, `reporte-prestamos-${Date.now()}.pdf`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPrestamosCSV = async () => {
    try {
      setLoading(true);
      const blob = await descargarReportePrestamosCSV(formatFecha(fechaInicio), formatFecha(fechaFin), tipoUsuarioSolFiltro, rutPrestamoFiltro);
      descargarArchivo(blob, `reporte-prestamos-${Date.now()}.csv`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Equipos
  const handlePrevisualizarEquiposPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteEquiposPDF();
      previsualizarPDF(blob);
      showSuccessAlert('Vista previa abierta', 'El reporte se ha abierto en una nueva pestaña');
    } catch {
      showErrorAlert('Error', 'No se pudo previsualizar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarEquiposPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteEquiposPDF();
      descargarArchivo(blob, `reporte-equipos-${Date.now()}.pdf`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarEquiposCSV = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteEquiposCSV();
      descargarArchivo(blob, `reporte-equipos-${Date.now()}.csv`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Usuarios
  const handlePrevisualizarUsuariosPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteUsuariosPDF(tipoUsuarioFiltro, carreraFiltro);
      previsualizarPDF(blob);
      showSuccessAlert('Vista previa abierta', 'El reporte se ha abierto en una nueva pestaña');
    } catch {
      showErrorAlert('Error', 'No se pudo previsualizar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarUsuariosPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteUsuariosPDF(tipoUsuarioFiltro, carreraFiltro);
      descargarArchivo(blob, `reporte-usuarios-${Date.now()}.pdf`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarUsuariosCSV = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteUsuariosCSV(tipoUsuarioFiltro, carreraFiltro);
      descargarArchivo(blob, `reporte-usuarios-${Date.now()}.csv`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Estadísticas
  const handlePrevisualizarEstadisticasPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteEstadisticasPDF(mesesHistorial);
      previsualizarPDF(blob);
      showSuccessAlert('Vista previa abierta', 'El reporte se ha abierto en una nueva pestaña');
    } catch {
      showErrorAlert('Error', 'No se pudo previsualizar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarEstadisticasPDF = async () => {
    try {
      setLoading(true);
      const blob = await descargarReporteEstadisticasPDF(mesesHistorial);
      descargarArchivo(blob, `reporte-estadisticas-${Date.now()}.pdf`);
      showSuccessAlert('Descarga exitosa', 'El reporte ha sido descargado');
    } catch {
      showErrorAlert('Error', 'No se pudo descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const renderFiltrosFechas = () => (
    <div className="reportes-filters-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
      <div className="filter-group">
        <label className="filter-label"><FontAwesomeIcon icon={faCalendar} /> Fecha de Inicio:</label>
        <DatePicker
          selected={fechaInicio}
          onChange={(date) => setFechaInicio(date)}
          selectsStart
          startDate={fechaInicio}
          endDate={fechaFin}
          maxDate={new Date()}
          locale="es"
          placeholderText="Seleccione fecha inicio"
          dateFormat="dd/MM/yyyy"
          className="date-input-picker"
        />
      </div>
      <div className="filter-group">
        <label className="filter-label"><FontAwesomeIcon icon={faCalendar} /> Fecha de Término:</label>
        <DatePicker
          selected={fechaFin}
          onChange={(date) => setFechaFin(date)}
          selectsEnd
          startDate={fechaInicio}
          endDate={fechaFin}
          minDate={fechaInicio}
          maxDate={new Date()}
          locale="es"
          placeholderText="Seleccione fecha fin"
          dateFormat="dd/MM/yyyy"
          className="date-input-picker"
        />
      </div>
      
      {/* Filtro Categoría */}
      <div className="filter-group">
        <label className="filter-label"><FontAwesomeIcon icon={faTags} /> Categoría:</label>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="date-input-picker"
          style={{ padding: '8px', minWidth: '150px' }}
        >
          <option value="">Todas las Categorías</option>
          {categorias.map(c => (
            <option key={c.ID_Categoria} value={c.Descripcion}>{c.Descripcion}</option>
          ))}
        </select>
      </div>

      {/* Filtro Tipo de Usuario (para pestañas Solicitudes y Préstamos) */}
      {(activeTab === 'solicitudes' || activeTab === 'prestamos') && (
          <div className="filter-group">
            <label className="filter-label"><FontAwesomeIcon icon={faUsers} /> Tipo:</label>
            <select
              value={tipoUsuarioSolFiltro}
              onChange={(e) => {
                setTipoUsuarioSolFiltro(e.target.value);
                if (e.target.value !== 'Alumno') setCarreraFiltro('');
              }}
              className="date-input-picker"
              style={{ padding: '8px', minWidth: '130px' }}
            >
              <option value="">Todos</option>
              <option value="Alumno">Alumno</option>
              <option value="Profesor">Profesor</option>
            </select>
          </div>
      )}

      {/* Filtro Carrera - en Solicitudes/Préstamos solo si es Alumno, en otras pestañas siempre */}
      {((!['solicitudes', 'prestamos'].includes(activeTab)) || tipoUsuarioSolFiltro === 'Alumno') && (
      <div className="filter-group">
        <label className="filter-label"><FontAwesomeIcon icon={faGraduationCap} /> Carrera:</label>
        <select
          value={carreraFiltro}
          onChange={(e) => setCarreraFiltro(e.target.value)}
          className="date-input-picker"
          style={{ padding: '8px', minWidth: '200px' }}
        >
          <option value="">Todas las Carreras</option>
          {carreras.map(c => (
            <option key={c.ID_Carrera} value={c.Nombre_Carrera}>{c.Nombre_Carrera}</option>
          ))}
        </select>
      </div>
      )}

      {/* Filtro RUT (solo para pestaña Préstamos) */}
      {activeTab === 'prestamos' && (
        <div className="filter-group">
          <label className="filter-label">RUT:</label>
          <input
            type="text"
            value={rutPrestamoFiltro}
            onChange={(e) => {
              let val = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase();
              if (val.length > 9) val = val.slice(0, 9);
              if (val.length > 1) {
                const cuerpo = val.slice(0, -1);
                const dv = val.slice(-1);
                let formatted = '';
                const reversed = cuerpo.split('').reverse();
                reversed.forEach((c, i) => {
                  if (i > 0 && i % 3 === 0) formatted = '.' + formatted;
                  formatted = c + formatted;
                });
                val = formatted + '-' + dv;
              }
              setRutPrestamoFiltro(val);
            }}
            placeholder="Ej: 12.345.678-9"
            className="date-input-picker"
            style={{ padding: '8px', minWidth: '140px' }}
            maxLength={12}
          />
        </div>
      )}

      <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
        <button 
          className="btn-clear"
          onClick={() => {
            setFechaInicio(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
            setFechaFin(new Date());
            setCarreraFiltro('');
            setCategoriaFiltro('');
            setTipoUsuarioSolFiltro('');
            setRutPrestamoFiltro('');
          }}
          disabled={!fechaInicio && !fechaFin && !carreraFiltro && !categoriaFiltro && !tipoUsuarioSolFiltro && !rutPrestamoFiltro}
        >
          Limpiar
        </button>
        <button 
          className="btn-create"
          onClick={() => {
            cargarDatosGraficos();
            showSuccessAlert('Filtros aplicados', 'Los filtros se han aplicado correctamente. Genera el reporte con los botones de abajo.');
          }}
          style={{ height: '38px', margin: 0 }}
        >
          <FontAwesomeIcon icon={faChartBar} /> Filtrar
        </button>
      </div>
    </div>
  );

  return (
    <div className="main-container">
      <h1 className="title-page">Reportes del Sistema</h1>
      
      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'solicitudes' ? 'active' : ''}`}
          onClick={() => setActiveTab('solicitudes')}
        >
          <FontAwesomeIcon icon={faClipboardList} /> Solicitudes
        </button>
        <button 
          className={`tab-button ${activeTab === 'prestamos' ? 'active' : ''}`}
          onClick={() => setActiveTab('prestamos')}
        >
          <FontAwesomeIcon icon={faBoxOpen} /> Préstamos
        </button>
        <button 
          className={`tab-button ${activeTab === 'equipos' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipos')}
        >
          <FontAwesomeIcon icon={faLaptop} /> Equipos
        </button>
        <button 
          className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          <FontAwesomeIcon icon={faUsers} /> Usuarios
        </button>
        <button 
          className={`tab-button ${activeTab === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setActiveTab('estadisticas')}
        >
          <FontAwesomeIcon icon={faChartBar} /> Estadísticas
        </button>
      </div>

      {/* Contenido de pestañas */}
      <div className="tab-content">
        
        {/* Reporte de Solicitudes */}
        {activeTab === 'solicitudes' && (
          <div className="reporte-section animate-fade-in">
            <div className="info-section">
              <h3>Reporte de Solicitudes</h3>
              <p>Genera y descarga el informe detallado de solicitudes.</p>
            </div>

            {renderFiltrosFechas()}

            <div className="actions-grid">
              <div className="action-card" onClick={handlePrevisualizarSolicitudesPDF}>
                <FontAwesomeIcon icon={faEye} className="action-icon" />
                <span className="action-title">Vista Previa</span>
                <span className="action-desc">Ver en el navegador</span>
              </div>
              <div className="action-card" onClick={handleDescargarSolicitudesPDF}>
                <FontAwesomeIcon icon={faFilePdf} className="action-icon" />
                <span className="action-title">Descargar PDF</span>
                <span className="action-desc">Formato documento portátil</span>
              </div>
              <div className="action-card" onClick={handleDescargarSolicitudesCSV}>
                <FontAwesomeIcon icon={faFileCsv} className="action-icon" />
                <span className="action-title">Descargar CSV</span>
                <span className="action-desc">Formato separado por comas</span>
              </div>
            </div>
          </div>
        )}

        {/* Reporte de Préstamos */}
        {activeTab === 'prestamos' && (
          <div className="reporte-section animate-fade-in">
            <div className="info-section">
              <h3>Reporte de Préstamos</h3>
              <p>Historial completo de préstamos y devoluciones.</p>
            </div>

            {renderFiltrosFechas()}

            <div className="actions-grid">
              <div className="action-card" onClick={handlePrevisualizarPrestamosPDF}>
                <FontAwesomeIcon icon={faEye} className="action-icon" />
                <span className="action-title">Vista Previa</span>
                <span className="action-desc">Ver en el navegador</span>
              </div>
              <div className="action-card" onClick={handleDescargarPrestamosPDF}>
                <FontAwesomeIcon icon={faFilePdf} className="action-icon" />
                <span className="action-title">Descargar PDF</span>
                <span className="action-desc">Formato documento portátil</span>
              </div>
              <div className="action-card" onClick={handleDescargarPrestamosCSV}>
                <FontAwesomeIcon icon={faFileCsv} className="action-icon" />
                <span className="action-title">Descargar CSV</span>
                <span className="action-desc">Formato separado por comas</span>
              </div>
            </div>
          </div>
        )}

        {/* Reporte de Equipos */}
        {activeTab === 'equipos' && (
          <div className="reporte-section animate-fade-in">
            <div className="info-section">
              <h3>Reporte de Equipos</h3>
              <p>Inventario actualizado y estado de los equipos.</p>
            </div>

            <div className="actions-grid">
              <div className="action-card" onClick={handlePrevisualizarEquiposPDF}>
                <FontAwesomeIcon icon={faEye} className="action-icon" />
                <span className="action-title">Vista Previa</span>
                <span className="action-desc">Ver en el navegador</span>
              </div>
              <div className="action-card" onClick={handleDescargarEquiposPDF}>
                <FontAwesomeIcon icon={faFilePdf} className="action-icon" />
                <span className="action-title">Descargar PDF</span>
                <span className="action-desc">Formato documento portátil</span>
              </div>
              <div className="action-card" onClick={handleDescargarEquiposCSV}>
                <FontAwesomeIcon icon={faFileCsv} className="action-icon" />
                <span className="action-title">Descargar CSV</span>
                <span className="action-desc">Formato separado por comas</span>
              </div>
            </div>
          </div>
        )}

        {/* Reporte de Usuarios */}
        {activeTab === 'usuarios' && (
          <div className="reporte-section animate-fade-in">
            <div className="info-section">
              <h3>Reporte de Usuarios</h3>
              <p>Listado de usuarios registrados en la plataforma.</p>
            </div>

            <div className="reportes-filters-section">
              <div className="filter-group">
                <label className="filter-label">Tipo de Usuario:</label>
                <select 
                  value={tipoUsuarioFiltro}
                  onChange={(e) => setTipoUsuarioFiltro(e.target.value)}
                  className="date-input"
                >
                  <option value="">Todos</option>
                  <option value="Alumno">Alumnos</option>
                  <option value="Profesor">Profesores</option>
                  <option value="Administrador">Administradores</option>
                </select>
              </div>

              {/* Filtro Carrera (Solo para Alumnos) */}
              {tipoUsuarioFiltro === 'Alumno' && (
                <div className="filter-group">
                  <label className="filter-label"><FontAwesomeIcon icon={faGraduationCap} /> Carrera:</label>
                  <select
                    value={carreraFiltro}
                    onChange={(e) => setCarreraFiltro(e.target.value)}
                    className="date-input"
                    style={{ minWidth: '200px' }}
                  >
                    <option value="">Todas las Carreras</option>
                    {carreras.map(c => (
                      <option key={c.ID_Carrera} value={c.Nombre_Carrera}>{c.Nombre_Carrera}</option>
                    ))}
                  </select>
                </div>
              )}

              {(tipoUsuarioFiltro || carreraFiltro) && (
                <button 
                  className="btn-clear"
                  onClick={() => {
                    setTipoUsuarioFiltro('');
                    setCarreraFiltro('');
                  }}
                >
                  Limpiar Filtros
                </button>
              )}
            </div>

            <div className="actions-grid">
              <div className="action-card" onClick={handlePrevisualizarUsuariosPDF}>
                <FontAwesomeIcon icon={faEye} className="action-icon" />
                <span className="action-title">Vista Previa</span>
                <span className="action-desc">Ver en el navegador</span>
              </div>
              <div className="action-card" onClick={handleDescargarUsuariosPDF}>
                <FontAwesomeIcon icon={faFilePdf} className="action-icon" />
                <span className="action-title">Descargar PDF</span>
                <span className="action-desc">Formato documento portátil</span>
              </div>
              <div className="action-card" onClick={handleDescargarUsuariosCSV}>
                <FontAwesomeIcon icon={faFileCsv} className="action-icon" />
                <span className="action-title">Descargar CSV</span>
                <span className="action-desc">Formato separado por comas</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="reporte-section animate-fade-in">
            <div className="info-section" style={{ marginBottom: '2rem' }}>
              <h3>Estadísticas Generales</h3>
              <p>Dashboard interactivo de KPIs y métricas del sistema.</p>
            </div>

            <GraficosReportes 
              datosGraficos={datosGraficos} 
              mesesHistorial={mesesHistorial}
              setMesesHistorial={setMesesHistorial}
            />

            <div className="actions-grid" style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
              <div className="action-card" onClick={handlePrevisualizarEstadisticasPDF}>
                <FontAwesomeIcon icon={faEye} className="action-icon" />
                <span className="action-title">Reporte PDF</span>
                <span className="action-desc">Previsualizar reporte estadístico</span>
              </div>
              <div className="action-card" onClick={handleDescargarEstadisticasPDF}>
                <FontAwesomeIcon icon={faFilePdf} className="action-icon" />
                <span className="action-title">Descargar PDF</span>
                <span className="action-desc">Guardar reporte estadístico</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="modal-overlay">
          <div className="loading-modal">
            <FontAwesomeIcon icon={faDownload} spin size="3x" className="loading-icon" />
            <p>Generando reporte...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
