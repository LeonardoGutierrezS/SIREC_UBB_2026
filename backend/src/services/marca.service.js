"use strict";
import Marca from "../entity/marca.entity.js";
import Equipos from "../entity/equipos.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createMarcaService(body) {
  try {
    const marcaRepository = AppDataSource.getRepository(Marca);

    // Normalizar el nombre (solo trim para evitar espacios vacíos, se respeta el formato del usuario)
    const marcaNormalizada = body.Descripcion.trim().replace(/\s+/g, " ");

    // Verificar si existe (case-insensitive)
    const marcas = await marcaRepository.find();
    const existingMarca = marcas.find(
      m => m.Descripcion.toLowerCase() === marcaNormalizada.toLowerCase()
    );

    if (existingMarca) {
      return [null, "La marca ya existe"];
    }

    const newMarca = marcaRepository.create({
      Descripcion: marcaNormalizada,
    });

    const marcaSaved = await marcaRepository.save(newMarca);

    return [marcaSaved, null];
  } catch (error) {
    console.error("Error al crear la marca:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getMarcaService(id) {
  try {
    const marcaRepository = AppDataSource.getRepository(Marca);

    const marcaFound = await marcaRepository.findOne({
      where: { ID_Marca: id },
    });

    if (!marcaFound) return [null, "Marca no encontrada"];

    return [marcaFound, null];
  } catch (error) {
    console.error("Error al obtener la marca:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getMarcasService() {
  try {
    const marcaRepository = AppDataSource.getRepository(Marca);

    const marcas = await marcaRepository.find();

    return [marcas || [], null];
  } catch (error) {
    console.error("Error al obtener las marcas:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateMarcaService(id, body) {
  try {
    const marcaRepository = AppDataSource.getRepository(Marca);

    const marcaFound = await marcaRepository.findOne({
      where: { ID_Marca: id },
    });

    if (!marcaFound) return [null, "Marca no encontrada"];

    // Normalizar el nombre (solo trim, respetar formato)
    const marcaNormalizada = body.Descripcion.trim().replace(/\s+/g, " ");

    // Verificar si existe otra marca con el mismo nombre (case-insensitive) y distinto ID
    const marcas = await marcaRepository.find();
    const existingMarca = marcas.find(
      m => m.Descripcion.toLowerCase() === marcaNormalizada.toLowerCase() && m.ID_Marca !== parseInt(id)
    );

    if (existingMarca) {
      return [null, "Ya existe otra marca con el mismo nombre"];
    }

    // Actualizar el campo Descripcion
    marcaFound.Descripcion = marcaNormalizada;
    
    // Guardar los cambios
    const marcaUpdated = await marcaRepository.save(marcaFound);

    console.log('Marca actualizada en BD:', marcaUpdated);

    return [marcaUpdated, null];
  } catch (error) {
    console.error("Error al actualizar la marca:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteMarcaService(id) {
  try {
    const marcaRepository = AppDataSource.getRepository(Marca);
    const equipoRepository = AppDataSource.getRepository(Equipos);

    const marcaFound = await marcaRepository.findOne({
      where: { ID_Marca: id },
    });

    if (!marcaFound) return [null, "Marca no encontrada"];

    // Verificar si la marca está asociada a algún equipo
    const equiposConMarca = await equipoRepository.count({
      where: { ID_Marca: id },
    });

    if (equiposConMarca > 0) {
      return [null, `No se puede eliminar la marca porque está asociada a ${equiposConMarca} equipo(s)`];
    }

    const marcaDeleted = await marcaRepository.remove(marcaFound);

    return [marcaDeleted, null];
  } catch (error) {
    console.error("Error al eliminar la marca:", error);
    return [null, "Error interno del servidor"];
  }
}
