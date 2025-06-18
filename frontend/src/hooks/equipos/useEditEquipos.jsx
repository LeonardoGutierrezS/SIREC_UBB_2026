import { useState } from "react";
import { updateEquipo } from "@services/equipos.service.js";

const useEditEquipo = (setEquipos) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dataEquipo, setDataEquipo] = useState([]);

  const handleClickUpdate = () => {
    setIsPopupOpen(true);
  };

  const handleUpdate = async (updatedData) => {
    if (!dataEquipo[0]) return;
    const id = dataEquipo[0].ID_Equipo || dataEquipo[0].id || dataEquipo[0]._id;
    const result = await updateEquipo(id, updatedData);
    setEquipos((prev) =>
      prev.map((equipo) =>
        equipo.ID_Equipo === id ? { ...equipo, ...updatedData } : equipo
      )
    );
    setIsPopupOpen(false);
    setDataEquipo([]);
    return result;
  };

  return {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataEquipo,
    setDataEquipo,
  };
};

export default useEditEquipo;