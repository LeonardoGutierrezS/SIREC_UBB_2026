import { useEffect, useState } from "react";
import { getEquipos } from "@services/equipos.service.js";

const useEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipos = async () => {
    setLoading(true);
    const data = await getEquipos();
    setEquipos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipos();
    // eslint-disable-next-line
  }, []);

  return { equipos, fetchEquipos, setEquipos, loading };
};

export default useEquipos;