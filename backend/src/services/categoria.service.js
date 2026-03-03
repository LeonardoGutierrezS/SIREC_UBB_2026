"use strict";
import Categoria from "../entity/categoria.entity.js";
import Equipos from "../entity/equipos.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createCategoriaService(body) {
  try {
    const categoriaRepository = AppDataSource.getRepository(Categoria);

    const existingCategoria = await categoriaRepository.findOne({
      where: { Descripcion: body.Descripcion },
    });

    if (existingCategoria) {
      return [null, "La categoría ya existe"];
    }

    const newCategoria = categoriaRepository.create({
      Descripcion: body.Descripcion,
    });

    const categoriaSaved = await categoriaRepository.save(newCategoria);

    return [categoriaSaved, null];
  } catch (error) {
    console.error("Error al crear la categoría:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getCategoriaService(id) {
  try {
    const categoriaRepository = AppDataSource.getRepository(Categoria);

    const categoriaFound = await categoriaRepository.findOne({
      where: { ID_Categoria: id },
    });

    if (!categoriaFound) return [null, "Categoría no encontrada"];

    return [categoriaFound, null];
  } catch (error) {
    console.error("Error al obtener la categoría:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getCategoriasService() {
  try {
    const categoriaRepository = AppDataSource.getRepository(Categoria);

    const categorias = await categoriaRepository.find();

    if (!categorias || categorias.length === 0) {
      return [null, "No hay categorías"];
    }

    return [categorias, null];
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateCategoriaService(id, body) {
  try {
    const categoriaRepository = AppDataSource.getRepository(Categoria);
    const equiposRepository = AppDataSource.getRepository(Equipos);

    const categoriaFound = await categoriaRepository.findOne({
      where: { ID_Categoria: id },
    });

    if (!categoriaFound) return [null, "Categoría no encontrada"];

    // Verificar si hay equipos asociados a esta categoría
    const equiposCount = await equiposRepository.count({
      where: { ID_Categoria: id },
    });

    if (equiposCount > 0) {
      return [null, `No se puede editar la categoría porque tiene ${equiposCount} equipo(s) asociado(s)`];
    }

    // Solo limpiar espacios, NO convertir a minúsculas
    const categoriaNormalizada = body.Descripcion.trim()
      .replace(/\s+/g, ' ');

    const existingCategoria = await categoriaRepository.findOne({
      where: { Descripcion: categoriaNormalizada },
    });

    if (existingCategoria && existingCategoria.ID_Categoria !== id) {
      return [null, "Ya existe otra categoría con el mismo nombre"];
    }

    // Actualizar usando save() en lugar de update()
    categoriaFound.Descripcion = categoriaNormalizada;
    const categoriaUpdated = await categoriaRepository.save(categoriaFound);

    return [categoriaUpdated, null];
  } catch (error) {
    console.error("Error al actualizar la categoría:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteCategoriaService(id) {
  try {
    const categoriaRepository = AppDataSource.getRepository(Categoria);
    const equiposRepository = AppDataSource.getRepository(Equipos);

    const categoriaFound = await categoriaRepository.findOne({
      where: { ID_Categoria: id },
    });

    if (!categoriaFound) return [null, "Categoría no encontrada"];

    // Verificar si hay equipos asociados a esta categoría
    const equiposCount = await equiposRepository.count({
      where: { ID_Categoria: id },
    });

    if (equiposCount > 0) {
      return [null, `No se puede eliminar la categoría porque tiene ${equiposCount} equipo(s) asociado(s)`];
    }

    const categoriaDeleted = await categoriaRepository.remove(categoriaFound);

    return [categoriaDeleted, null];
  } catch (error) {
    console.error("Error al eliminar la categoría:", error);
    return [null, "Error interno del servidor"];
  }
}
