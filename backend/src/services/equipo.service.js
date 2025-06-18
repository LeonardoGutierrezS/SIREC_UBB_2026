import { AppDataSource } from "../config/configDb.js";
const equipoRepo = AppDataSource.getRepository("Equipo");

export const findAllEquipos = async () => {
  return await equipoRepo.find();
};

export const findEquipoById = async (id) => {
  return await equipoRepo.findOneBy({ ID_Equipo: parseInt(id) });
};

export const createEquipo = async (data) => {
  const nuevoEquipo = equipoRepo.create(data);
  return await equipoRepo.save(nuevoEquipo);
};

export const updateEquipo = async (id, data) => {
  const equipo = await equipoRepo.findOneBy({ ID_Equipo: parseInt(id) });
  if (!equipo) return null;
  equipoRepo.merge(equipo, data);
  return await equipoRepo.save(equipo);
};

export const deleteEquipo = async (id) => {
  return await equipoRepo.delete({ ID_Equipo: parseInt(id) });
};