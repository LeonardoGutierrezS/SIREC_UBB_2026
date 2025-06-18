import { useState } from "react";


const today = new Date().toISOString().split('T')[0];

const initialState = {
  Modelo: "",
  Tipo: "",
  ID_Estado: "",
  Condicion: "",
  Propietario: "",
  Fecha_Alta_LAB: today, 
};

const estados = [
  { id: 1, nombre: "Disponible" },
  { id: 2, nombre: "Prestado" },
  { id: 3, nombre: "No disponible" },
];

const EquipoForm = ({ onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, ID_Estado: Number(form.ID_Estado) });
  };

  return (
    <div className="popup-backdrop">
      <div className="popup-form">
        <h2>Ingresar nuevo equipo</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="Modelo">Modelo</label>
          <input
            id="Modelo"
            name="Modelo"
            placeholder="Modelo"
            value={form.Modelo}
            onChange={handleChange}
            required
          />

          <label htmlFor="Tipo">Tipo</label>
          <input
            id="Tipo"
            name="Tipo"
            placeholder="Tipo"
            value={form.Tipo}
            onChange={handleChange}
            required
          />

          <label htmlFor="ID_Estado">Estado</label>
          <select
            id="ID_Estado"
            name="ID_Estado"
            value={form.ID_Estado}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione estado</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>

          <label htmlFor="Condicion">Condición</label>
          <input
            id="Condicion"
            name="Condicion"
            placeholder="Condición"
            value={form.Condicion}
            onChange={handleChange}
            required
          />

          <label htmlFor="Propietario">Propietario</label>
          <input
            id="Propietario"
            name="Propietario"
            placeholder="Propietario"
            value={form.Propietario}
            onChange={handleChange}
            required
          />

          <label htmlFor="Fecha_Alta_LAB">Fecha Alta</label>
          <input
            id="Fecha_Alta_LAB"
            name="Fecha_Alta_LAB"
            type="date"
            placeholder="Fecha Alta"
            value={form.Fecha_Alta_LAB}
            onChange={handleChange}
            required
          />

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              Guardar
            </button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipoForm;