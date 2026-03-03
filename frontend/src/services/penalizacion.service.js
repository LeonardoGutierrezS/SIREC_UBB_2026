import instance from "./root.service.js";

// === CATÁLOGO DE PENALIZACIONES ===

export async function getPenalizaciones() {
  try {
    const { data } = await instance.get("/penalizaciones");
    return [data.data || [], null];
  } catch (error) {
    return [null, error.response?.data?.message || error.message];
  }
}

export async function updatePenalizacion(id, body) {
  try {
    const { data } = await instance.patch(`/penalizaciones/${id}`, body);
    return [data.data || data, null];
  } catch (error) {
    return [null, error.response?.data?.message || error.message];
  }
}

// === GESTIÓN DE USUARIOS SANCIONADOS (TIENE_PENALIZACION) ===

export async function getAsignadas() {
  try {
    const { data } = await instance.get("/tiene-penalizacion");
    return [data.data || [], null];
  } catch (error) {
     // Si es 204 No Content, retornar array vacío
     if (error.response?.status === 204) return [[], null];
     return [null, error.response?.data?.message || error.message];
  }
}

export async function getActivasPorUsuario(rut) {
  try {
    const { data } = await instance.get(`/tiene-penalizacion/activas/${rut}`);
    return [data.data || [], null];
  } catch (error) {
      if (error.response?.status === 204) return [[], null];
      return [null, error.response?.data?.message || error.message];
  }
}

export async function asignarPenalizacion(body) {
  try {
    const { data } = await instance.post("/tiene-penalizacion", body);
    return [data.data || data, null];
  } catch (error) {
    return [null, error.response?.data?.message || error.message];
  }
}

export async function finalizarPenalizacion(id, fechaFin) {
  try {
    const body = fechaFin ? { Fecha_Fin: fechaFin } : {};
    // La ruta ahora es /:id/finalizar
    const { data } = await instance.patch(`/tiene-penalizacion/${id}/finalizar`, body);
    return [data.data || data, null];
  } catch (error) {
    return [null, error.response?.data?.message || error.message];
  }
}
