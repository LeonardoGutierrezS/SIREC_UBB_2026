import { deleteEquipo } from "@services/equipos.service.js";

const useDeleteEquipo = (fetchEquipos, setDataEquipo) => {
  const handleDelete = async (equiposSeleccionados) => {
    for (const equipo of equiposSeleccionados) {
      const id = equipo.ID_Equipo || equipo.id || equipo._id;
      await deleteEquipo(id);
    }
    setDataEquipo([]);
    fetchEquipos();
  };

  return { handleDelete };
};

export default useDeleteEquipo;