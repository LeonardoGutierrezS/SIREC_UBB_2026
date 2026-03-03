import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faBoxOpen,
  faLaptop,
  faUsers,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import "@styles/DashboardStats.css";

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const GraficosReportes = ({ datosGraficos, mesesHistorial, setMesesHistorial }) => {
  if (!datosGraficos) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando gráficos...</p>
      </div>
    );
  }

  // Cálculos para KPIs
  // Excluir administradores de la cuenta de usuarios registrados para reportes
  const totalSolicitudes = Object.values(datosGraficos.solicitudesPorEstado || {}).reduce((a, b) => a + b, 0);
  const totalEquipos = Object.values(datosGraficos.equiposPorCategoria || {}).reduce((a, b) => a + b, 0);
  
  // Arreglado: Usar el conteo total del sistema
  const totalUsuarios = datosGraficos.totalUsuariosSistema || 0;
  
  const prestamosActivos = datosGraficos.solicitudesPorEstado?.entregados || 0;
  const totalSancionados = datosGraficos.totalSancionados || 0;

  // Paleta de colores premium
  const colors = [
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(201, 203, 207, 0.8)",
    "rgba(101, 143, 241, 0.8)",
    "rgba(241, 101, 160, 0.8)",
    "rgba(101, 241, 143, 0.8)"
  ];

  // Configuración de solicitudes por estado (Pie) - Ahora con números en labels
  const solicitudesPorEstadoData = {
    labels: [
      `Pendientes (${datosGraficos.solicitudesPorEstado.pendientes})`,
      `Listo para Entregar (${datosGraficos.solicitudesPorEstado.listoParaEntregar})`,
      `Listo para recepcionar (${datosGraficos.solicitudesPorEstado.entregados})`,
      `Devueltos (${datosGraficos.solicitudesPorEstado.devueltos})`,
      `Rechazados (${datosGraficos.solicitudesPorEstado.rechazados})`,
    ],
    datasets: [
      {
        data: [
          datosGraficos.solicitudesPorEstado.pendientes,
          datosGraficos.solicitudesPorEstado.listoParaEntregar,
          datosGraficos.solicitudesPorEstado.entregados,
          datosGraficos.solicitudesPorEstado.devueltos,
          datosGraficos.solicitudesPorEstado.rechazados,
        ],
        backgroundColor: colors.slice(0, 5),
        borderWidth: 1,
      },
    ],
  };

  // Gráfico de Tipos de Préstamo (Pie)
  const solicitudesPorTipoData = {
    labels: [
      `Diarias (${datosGraficos.solicitudesPorTipo.diarias})`, 
      `Largo Plazo (${datosGraficos.solicitudesPorTipo.largoPlazo})`
    ],
    datasets: [
      {
        data: [
          datosGraficos.solicitudesPorTipo.diarias,
          datosGraficos.solicitudesPorTipo.largoPlazo,
        ],
        backgroundColor: [colors[0], colors[5]],
        borderWidth: 1,
      },
    ],
  };

  // Inventario por Categoría (Pie - Solicitado por el usuario)
  const categoriasLabels = Object.keys(datosGraficos.equiposPorCategoria || {});
  const categoriasValues = Object.values(datosGraficos.equiposPorCategoria || {});
  const equiposPorCategoriaData = {
    labels: categoriasLabels.map((l, i) => `${l} (${categoriasValues[i]})`),
    datasets: [
      {
        data: categoriasValues,
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  // Solicitudes por Carrera/Cargo (Grouped Bar - Reformulado con Wrapping)
  const wrapLabel = (label, maxChars = 15) => {
    const words = label.split(' ');
    const lines = [];
    let currentLine = '';
    words.forEach(word => {
      if ((currentLine + word).length > maxChars) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    lines.push(currentLine.trim());
    return lines;
  };

  const rawCarreraLabels = Object.keys(datosGraficos.solicitudesPorCarrera || {});
  const wrappedCarreraLabels = rawCarreraLabels.map(label => wrapLabel(label, 18));

  const solicitudesPorCarreraData = {
    labels: wrappedCarreraLabels,
    datasets: [
      {
        label: "Diario",
        data: rawCarreraLabels.map(label => datosGraficos.solicitudesPorCarrera[label]?.diario || 0),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Largo Plazo",
        data: rawCarreraLabels.map(label => datosGraficos.solicitudesPorCarrera[label]?.largoPlazo || 0),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  // Distribución de Usuarios (Pie) - Por Carrera y Cargo (Con solicitudes)
  const alumnosDist = datosGraficos.usuariosPorTipo?.alumnos || {};
  const profesoresDist = datosGraficos.usuariosPorTipo?.profesores || {};
  
  const labelAlumnos = Object.keys(alumnosDist).map(c => `Alumno: ${c}`);
  const dataAlumnos = Object.values(alumnosDist);
  
  const labelProfesores = Object.keys(profesoresDist).map(c => `Prof: ${c}`);
  const dataProfesores = Object.values(profesoresDist);

  const usuariosLabels = [...labelAlumnos, ...labelProfesores];
  const usuariosData = [...dataAlumnos, ...dataProfesores];

  const usuariosPorTipoData = {
    labels: usuariosLabels,
    datasets: [
      {
        data: usuariosData,
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  // Distribución General de Usuarios (Alumno vs Profesor únicamente)
  const totalAlumnos = Object.values(datosGraficos.usuariosPorTipo?.alumnos || {}).reduce((a, b) => a + b, 0);
  const totalProfesores = Object.values(datosGraficos.usuariosPorTipo?.profesores || {}).reduce((a, b) => a + b, 0);

  const usuariosGeneralData = {
    labels: ['Alumnos', 'Profesores'],
    datasets: [
      {
        data: [totalAlumnos, totalProfesores],
        backgroundColor: [colors[0], colors[2]],
        borderWidth: 1,
      },
    ],
  };

  // Tendencia de Solicitudes (Line) - GENERAL
  const solicitudesPorMesData = {
    labels: (datosGraficos.solicitudesPorMes || []).map((item) => {
      const fecha = new Date(item.mes);
      return fecha.toLocaleDateString("es-CL", { month: "short", year: "numeric" });
    }),
    datasets: [
      {
        label: "Total Solicitudes Mensuales",
        data: (datosGraficos.solicitudesPorMes || []).map((item) => parseInt(item.cantidad)),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 1)",
        tension: 0.4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "rgba(59, 130, 246, 1)",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  // [NUEVO] TENDENCIA MULTISERIE (Por Categoría)
  const tendenciaKeys = Object.keys(datosGraficos.tendenciaPorCategoria || {});
  const tendenciaMultiSerieData = {
    labels: tendenciaKeys, // Meses
    datasets: categoriasLabels.map((cat, index) => {
      return {
        label: cat,
        data: tendenciaKeys.map(mes => 
          (datosGraficos.tendenciaPorCategoria && datosGraficos.tendenciaPorCategoria[mes] && datosGraficos.tendenciaPorCategoria[mes][cat]) || 0
        ),
        borderColor: colors[index % colors.length],
        fill: false,
        tension: 0.3
      };
    })
  };



  // Préstamos por Equipo y Tipo de Usuario (Grouped Bar)
  const equipoTipoLabels = Object.keys(datosGraficos.prestamosPorEquipoTipo || {});
  const prestamosPorEquipoData = {
    labels: equipoTipoLabels,
    datasets: [
      {
        label: "Alumnos",
        data: equipoTipoLabels.map(cat => datosGraficos.prestamosPorEquipoTipo[cat]?.Alumno || 0),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Profesores",
        data: equipoTipoLabels.map(cat => datosGraficos.prestamosPorEquipoTipo[cat]?.Profesor || 0),
        backgroundColor: "rgba(255, 159, 64, 0.7)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const groupedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x', // Forzar vertical
    plugins: { 
      legend: { position: 'top' },
      datalabels: { display: false }
    },
    scales: {
      x: { 
        type: 'category',
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: { size: 11, weight: '500' },
          autoSkip: false
        }
      },
      y: { 
        beginAtZero: true, 
        ticks: { 
          stepSize: 1, 
          precision: 0,
          callback: (value) => Number.isInteger(value) ? value : null
        }
      }
    },
    layout: {
      padding: { bottom: 20, top: 10 }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { family: "'Inter', sans-serif", size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw}`
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 11
        },
        formatter: (value, ctx) => {
          const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value * 100) / sum).toFixed(1) + "%";
          return `${value}\n(${percentage})`;
        },
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowBlur: 3,
        display: (ctx) => {
          const value = ctx.dataset.data[ctx.dataIndex];
          const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return (value / sum) > 0.04; 
        }
      }
    },
    layout: { padding: 15 },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Barras horizontales
    plugins: { 
      legend: { display: false },
      datalabels: { display: false }
    },
    scales: {
      x: { 
        beginAtZero: true, 
        grid: { color: "#f1f5f9" },
        ticks: { stepSize: 1, precision: 0 }
      },
      y: { grid: { display: false } },
    },
  };
  


  // Calcular máximo para el eje Y del gráfico de tendencia
  const allLineData = tendenciaMultiSerieData.datasets.length 
    ? tendenciaMultiSerieData.datasets.flatMap(ds => ds.data)
    : solicitudesPorMesData.datasets.flatMap(ds => ds.data);
  const maxLineValue = Math.max(...allLineData, 0);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", align: "end" },
      tooltip: { mode: "index", intersect: false },
      datalabels: { display: false }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        suggestedMax: maxLineValue + 1,
        grid: { color: "#f1f5f9" },
        ticks: { 
          stepSize: 1, 
          precision: 0,
          callback: (value) => Number.isInteger(value) ? value : null
        }
      },
      x: { grid: { display: false } },
    },
  };
  


  return (
    <div className="graficos-container">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: "#eff6ff", color: "#3b82f6" }}>
            <FontAwesomeIcon icon={faClipboardList} />
          </div>
          <div className="kpi-content">
            <h4>Total Solicitudes</h4>
            <p className="kpi-value">{totalSolicitudes}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: "#f0fdf4", color: "#10b981" }}>
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>
          <div className="kpi-content">
            <h4>Préstamos Activos</h4>
            <p className="kpi-value">{prestamosActivos}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: "#fff7ed", color: "#f97316" }}>
            <FontAwesomeIcon icon={faLaptop} />
          </div>
          <div className="kpi-content">
            <h4>Total Equipos</h4>
            <p className="kpi-value">{totalEquipos}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: "#f5f3ff", color: "#8b5cf6" }}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="kpi-content">
            <h4>Usuarios Registrados</h4>
            <p className="kpi-value">{totalUsuarios}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: "#fff1f2", color: "#e11d48" }}>
            <FontAwesomeIcon icon={faBan} />
          </div>
          <div className="kpi-content">
            <h4>Sancionados</h4>
            <p className="kpi-value">{totalSancionados}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="grafico-card grafico-wide">
          <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Tendencia General vs Categorías</h4>
            <div className="trend-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                value={mesesHistorial} 
                onChange={(e) => setMesesHistorial(parseInt(e.target.value))}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
              >
                <option value={1}>1 mes</option>
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
              </select>
            </div>
          </div>
          <div className="chart-wrapper">
            {/* Si tenemos datos de tendencia multiserie, asumimos preferencia por mostrar detalle */}
             <Line data={tendenciaMultiSerieData.datasets.length ? tendenciaMultiSerieData : solicitudesPorMesData} options={lineOptions} />
          </div>
        </div>
        
        {/* Préstamos por Equipo: Alumnos vs Profesores */}
        <div className="grafico-card grafico-wide">
            <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>Préstamos por Equipo: Alumnos vs Profesores</h4>
              <div className="trend-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select 
                  value={mesesHistorial} 
                  onChange={(e) => setMesesHistorial(parseInt(e.target.value))}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                  <option value={1}>1 mes</option>
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                </select>
              </div>
            </div>
            <div className="chart-wrapper" style={{ height: '350px' }}>
                <Bar data={prestamosPorEquipoData} options={groupedBarOptions} />
            </div>
        </div>



        <div className="grafico-card">
          <h4>Estado de Solicitudes</h4>
          <div className="chart-wrapper">
            <Pie data={solicitudesPorEstadoData} options={pieOptions} />
          </div>
        </div>

        <div className="grafico-card">
          <h4>Tipos de Préstamo</h4>
          <div className="chart-wrapper">
            <Pie data={solicitudesPorTipoData} options={pieOptions} />
          </div>
        </div>

        <div className="grafico-card">
          <h4>Inventario por Categoría</h4>
          <div className="chart-wrapper">
            <Pie data={equiposPorCategoriaData} options={pieOptions} />
          </div>
        </div>

        <div className="grafico-card">
          <h4>Distribución General de Usuarios</h4>
          <div className="chart-wrapper">
             <Pie data={usuariosGeneralData} options={pieOptions} />
          </div>
        </div>

        <div className="grafico-card">
          <h4>Distribución Usuarios (Detalle Carrera/Cargo)</h4>
          <div className="chart-wrapper">
            <Pie data={usuariosPorTipoData} options={pieOptions} />
          </div>
        </div>

        <div className="grafico-card grafico-wide">
          <h4>Solicitudes por Carrera/Cargo: Diario vs Largo Plazo</h4>
          <div className="chart-wrapper" style={{ height: '400px' }}>
            <Bar data={solicitudesPorCarreraData} options={groupedBarOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficosReportes;
