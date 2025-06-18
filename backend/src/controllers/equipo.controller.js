import {    
    createEquipo as createEquipoService,
    deleteEquipo as deleteEquipoService,
    findAllEquipos,
    findEquipoById,
    updateEquipo as updateEquipoService,
} from "../services/equipo.service.js";

export const getEquipos = async (req, res) => {
    try {
    const equipos = await findAllEquipos();
    res.json(equipos);
    } catch (err) {
    res.status(500).json({ error: "Error al obtener equipos" });
    }
};

export const getEquipo = async (req, res) => {
    try {
    const equipo = await findEquipoById(req.params.id);
    if (!equipo) return res.status(404).json({ error: "Equipo no encontrado" });
    res.json(equipo);
    } catch (err) {
    res.status(500).json({ error: "Error al obtener equipo" });
    }
};

export const createEquipo = async (req, res) => {
    try {
    const equipoGuardado = await createEquipoService(req.body);
    res.status(201).json(equipoGuardado);
    } catch (err) {
    res.status(400).json({ error: "Error al crear equipo" ,details : err.message });
    }
};

export const updateEquipo = async (req, res) => {
    try {
    const equipoActualizado = await updateEquipoService(req.params.id, req.body);
    if (!equipoActualizado) return res.status(404).json({ error: "Equipo no encontrado" });
    res.json(equipoActualizado);
    } catch (err) {
    res.status(400).json({ error: "Error al actualizar equipo" });
    }
};

export const deleteEquipo = async (req, res) => {
    try {
    const result = await deleteEquipoService(req.params.id);
    if (result.affected === 0) return res.status(404).json({ error: "Equipo no encontrado" });
    res.json({ message: "Equipo eliminado" });
    } catch (err) {
    res.status(500).json({ error: "Error al eliminar equipo" });
    }
};