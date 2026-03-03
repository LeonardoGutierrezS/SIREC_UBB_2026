import axios from './root.service.js';

/**
 * Obtiene todas las marcas
 */
export async function getMarcas() {
  try {
    const { data } = await axios.get('/marca');
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al obtener marcas' };
  }
}

/**
 * Crea una nueva marca
 */
export async function createMarca(marcaData) {
  try {
    const { data } = await axios.post('/marca', marcaData);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al crear marca' };
  }
}

/**
 * Actualiza una marca
 */
export async function updateMarca(id, marcaData) {
  try {
    const { data } = await axios.put(`/marca/${id}`, marcaData);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al actualizar marca' };
  }
}

/**
 * Elimina una marca
 */
export async function deleteMarca(id) {
  try {
    const { data } = await axios.delete(`/marca/${id}`);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al eliminar marca' };
  }
}

/**
 * Obtiene todas las categorías
 */
export async function getCategorias() {
  try {
    const { data } = await axios.get('/categoria');
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al obtener categorías' };
  }
}

/**
 * Crea una nueva categoría
 */
export async function createCategoria(categoriaData) {
  try {
    const { data } = await axios.post('/categoria', categoriaData);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al crear categoría' };
  }
}

/**
 * Actualiza una categoría
 */
export async function updateCategoria(id, categoriaData) {
  try {
    const { data } = await axios.put(`/categoria/${id}`, categoriaData);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al actualizar categoría' };
  }
}

/**
 * Elimina una categoría
 */
export async function deleteCategoria(id) {
  try {
    const { data } = await axios.delete(`/categoria/${id}`);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al eliminar categoría' };
  }
}

/**
 * Obtiene todos los estados
 */
export async function getEstados() {
  try {
    const { data } = await axios.get('/estado');
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al obtener estados' };
  }
}

/**
 * Crea un nuevo estado
 */
export async function createEstado(estadoData) {
  try {
    const { data } = await axios.post('/estado', estadoData);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al crear estado' };
  }
}

/**
 * Actualiza un estado
 */
export async function updateEstado(id, estadoData) {
  try {
    const { data } = await axios.put(`/estado/${id}`, estadoData);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al actualizar estado' };
  }
}

/**
 * Elimina un estado
 */
export async function deleteEstado(id) {
  try {
    const { data } = await axios.delete(`/estado/${id}`);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al eliminar estado' };
  }
}
