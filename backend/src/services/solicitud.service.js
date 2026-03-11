"use strict";
import Solicitud from "../entity/solicitud.entity.js";
import Prestamo from "../entity/prestamo.entity.js";
import User from "../entity/user.entity.js";
import Equipos from "../entity/equipos.entity.js";
import TieneEstado from "../entity/tiene_estado.entity.js";
import TienePenalizacion from "../entity/tiene_penalizacion.entity.js";
import EstadoSchema from "../entity/estado.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { enviarEmailSolicitudCreada, enviarEmailDirectorNuevaSolicitud, enviarEmailNotificacionAdminSolicitudDiaria } from "./email.service.js";
import { In } from "typeorm";

/**
 * Crear una nueva solicitud de préstamo
 */
export async function createSolicitudService(body) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const userRepository = AppDataSource.getRepository(User);
    const equipoRepository = AppDataSource.getRepository(Equipos);

    // Verificar que el usuario existe
    const userFound = await userRepository.findOne({
      where: { Rut: body.Rut },
    });

    if (!userFound) {
      return [null, "El usuario no existe"];
    }

    // Verificar que el usuario está vigente
    if (!userFound.Vigente) {
      return [null, "El usuario no está vigente, no puede realizar solicitudes"];
    }

    // Verificar si el usuario tiene penalizaciones vigentes
    const tienePenalizacionRepository = AppDataSource.getRepository(TienePenalizacion);
    const penalizacionesUsuario = await tienePenalizacionRepository.find({
        where: { Rut: body.Rut },
        relations: ["penalizacion"]
    });

    const now = new Date();
    const penalizacionVigente = penalizacionesUsuario.find(p => {
        if (!p.Fecha_Fin) return true; // Indefinida = Vigente
        return new Date(p.Fecha_Fin) > now;
    });

    if (penalizacionVigente) {
        let mensaje = "El usuario se encuentra sancionado.";
        if (penalizacionVigente.penalizacion) {
            mensaje += ` Motivo: ${penalizacionVigente.penalizacion.Descripcion}.`;
        }
        if (penalizacionVigente.Fecha_Fin) {
            mensaje += ` Vence el: ${new Date(penalizacionVigente.Fecha_Fin).toLocaleDateString('es-CL')}.`;
        } else {
             mensaje += ` Sanción indefinida.`;
        }
        return [null, mensaje];
    }

    // Verificar que el equipo existe y está disponible
    const equipoFound = await equipoRepository.findOne({
      where: { ID_Num_Inv: body.ID_Num_Inv },
    });

    if (!equipoFound) {
      return [null, "El equipo no existe"];
    }

    if (!equipoFound.Disponible) {
      return [null, "El equipo no está disponible para préstamo"];
    }

    // Crear la solicitud (ID_Prestamo será null hasta que se apruebe)
    const fechaSolicitud = body.Fecha_Sol || new Date();
    const newSolicitud = solicitudRepository.create({
      Rut: body.Rut,
      ID_Num_Inv: body.ID_Num_Inv,
      Fecha_Sol: fechaSolicitud,
      Hora_Sol: body.Hora_Sol,
      Motivo_Sol: body.Motivo_Sol || null,
      Fecha_inicio_sol: body.Fecha_inicio_sol || fechaSolicitud,
      Fecha_termino_sol: body.Fecha_termino_sol || fechaSolicitud,
      ID_Prestamo: null, // Se llenará cuando se apruebe la solicitud
    });

    const solicitudSaved = await solicitudRepository.save(newSolicitud);

    // Obtener estado Solicitado
    const estadoRepository = AppDataSource.getRepository(EstadoSchema);
    const estadoSolicitado = await estadoRepository.findOne({ where: { Descripcion: "Solicitado" } });

    // Marcar el equipo como ocupado y en estado Solicitado
    await equipoRepository.update(
      { ID_Num_Inv: body.ID_Num_Inv },
      { 
        Disponible: false,
        estado: estadoSolicitado
      }
    );

    const solicitudWithRelations = await solicitudRepository.findOne({
      where: { ID_Solicitud: solicitudSaved.ID_Solicitud },
      relations: [
        "usuario", 
        "usuario.cargo", 
        "usuario.carrera", 
        "usuario.tipoUsuario", 
        "equipo",
        "equipo.marca",
        "equipo.categoria",
        "equipo.estado",
        "equipo.especificaciones",
        "prestamo"
      ],
    });

    // Enviar notificación por correo
    if (solicitudWithRelations) {
      await enviarEmailSolicitudCreada(solicitudWithRelations);
      
      // Determinar si es largo plazo: Fechas distintas
      const inicio = new Date(solicitudWithRelations.Fecha_inicio_sol).getTime();
      const termino = new Date(solicitudWithRelations.Fecha_termino_sol).getTime();
      
      const esLargoPlazo = solicitudWithRelations.Fecha_inicio_sol && 
                           solicitudWithRelations.Fecha_termino_sol && 
                           inicio !== termino;

      if (esLargoPlazo) {
        // Si es una solicitud de largo plazo, notificar a los Directores de Escuela
        await notificarDirectoresNuevaSolicitud(solicitudWithRelations);
      } else {
        // Si es diaria, notificar a los Administradores (excepto el principal)
        await notificarAdminsNuevaSolicitudDiaria(solicitudWithRelations);
      }
    }

    return [solicitudWithRelations, null];
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todas las solicitudes
 */
export async function getSolicitudesService() {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudes = await solicitudRepository.find({
      relations: [
        "usuario", 
        "usuario.cargo", 
        "usuario.carrera", 
        "usuario.tipoUsuario", 
        "equipo",
        "equipo.marca",
        "equipo.categoria",
        "equipo.estado",
        "equipo.especificaciones",
        "prestamo",
        "prestamo.autorizacion",
        "prestamo.autorizacion.usuario",
        "prestamo.devolucion",
        "prestamo.devolucion.usuario",
        "prestamo.tieneEstados",
        "prestamo.tieneEstados.estadoPrestamo"
      ],
      order: { Fecha_Sol: "DESC" },
    });

    return [solicitudes || [], null];
  } catch (error) {
    console.error("Error al obtener las solicitudes:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener solicitudes por usuario (RUT)
 */
export async function getSolicitudesPorUsuarioService(rut) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudes = await solicitudRepository.find({
      where: { Rut: rut },
      relations: [
        "usuario", 
        "usuario.cargo", 
        "usuario.carrera", 
        "usuario.tipoUsuario", 
        "equipo",
        "equipo.marca",
        "equipo.categoria",
        "equipo.estado",
        "equipo.especificaciones",
        "prestamo",
        "prestamo.autorizacion",
        "prestamo.autorizacion.usuario",
        "prestamo.devolucion",
        "prestamo.devolucion.usuario",
        "prestamo.tieneEstados",
        "prestamo.tieneEstados.estadoPrestamo"
      ],
      order: { Fecha_Sol: "DESC" },
    });

    return [solicitudes || [], null];
  } catch (error) {
    console.error("Error al obtener las solicitudes por usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener solicitudes por préstamo
 */
export async function getSolicitudesPorPrestamoService(prestamoId) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudes = await solicitudRepository.find({
      where: { ID_Prestamo: prestamoId },
      relations: [
        "usuario", 
        "usuario.cargo", 
        "usuario.carrera", 
        "usuario.tipoUsuario", 
        "equipo",
        "equipo.marca",
        "equipo.categoria",
        "equipo.estado",
        "prestamo",
        "prestamo.autorizacion",
        "prestamo.devolucion"
      ],
      order: { Fecha_Sol: "DESC" },
    });

    return [solicitudes || [], null];
  } catch (error) {
    console.error("Error al obtener las solicitudes por préstamo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener una solicitud por ID_Solicitud
 */
export async function getSolicitudService(idSolicitud) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudFound = await solicitudRepository.findOne({
      where: { ID_Solicitud: idSolicitud },
      relations: [
        "usuario", 
        "usuario.cargo", 
        "usuario.carrera", 
        "usuario.tipoUsuario", 
        "equipo",
        "equipo.marca",
        "equipo.categoria",
        "equipo.estado",
        "equipo.especificaciones",
        "prestamo",
        "prestamo.autorizacion",
        "prestamo.autorizacion.usuario",
        "prestamo.devolucion",
        "prestamo.devolucion.usuario",
        "prestamo.tieneEstados",
        "prestamo.tieneEstados.estadoPrestamo"
      ],
    });

    if (!solicitudFound) return [null, "Solicitud no encontrada"];

    return [solicitudFound, null];
  } catch (error) {
    console.error("Error al obtener la solicitud:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Eliminar una solicitud
 */
export async function deleteSolicitudService(idSolicitud) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudFound = await solicitudRepository.findOne({
      where: { ID_Solicitud: idSolicitud },
    });

    if (!solicitudFound) return [null, "Solicitud no encontrada"];

    // Solo se puede eliminar si no tiene préstamo asociado (no ha sido procesada)
    if (solicitudFound.ID_Prestamo) {
      return [null, "No se puede eliminar una solicitud que ya fue procesada"];
    }

    // Liberar el equipo antes de eliminar la solicitud
    const equipoRepository = AppDataSource.getRepository(Equipos);
    await equipoRepository.update(
      { ID_Num_Inv: solicitudFound.ID_Num_Inv },
      { Disponible: true }
    );

    const solicitudDeleted = await solicitudRepository.remove(solicitudFound);

    return [solicitudDeleted, null];
  } catch (error) {
    console.error("Error al eliminar la solicitud:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Función interna para notificar a los directores según el flujo definido
 */
async function notificarDirectoresNuevaSolicitud(solicitud) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const tipoUsuario = solicitud.usuario.tipoUsuario.Descripcion;
    const carreraId = solicitud.usuario.ID_Carrera;

    let cargosANotificar = [];

    if (tipoUsuario === "Alumno") {
      // Alumno IECI (Carrera ID 1) -> Director IECI (Cargo ID 1)
      // Alumno ICI (Carrera ID 2) -> Director ICI (Cargo ID 2)
      // Se asumen IDs según initialSetup, pero se podría buscar por nombre para más seguridad
      if (carreraId === 1) {
        cargosANotificar = [1];
      } else if (carreraId === 2) {
        cargosANotificar = [2];
      }
    } else if (tipoUsuario === "Profesor") {
      // Profesores -> Ambos directores
      cargosANotificar = [1, 2];
    }

    if (cargosANotificar.length > 0) {
      const directores = await userRepository.find({
        where: { ID_Cargo: In(cargosANotificar), Vigente: true },
        relations: ["tipoUsuario", "cargo", "carrera"]
      });

      for (const director of directores) {
        await enviarEmailDirectorNuevaSolicitud(director, solicitud);
      }
    }
  } catch (error) {
    console.error("Error en notificarDirectoresNuevaSolicitud:", error);
  }
}

/**
 * Función interna para notificar a los administradores de solicitudes diarias
 * Excluye al admin principal (RUT: 21308770-3)
 */
async function notificarAdminsNuevaSolicitudDiaria(solicitud) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    // Buscar todos los administradores activos
    // Se filtra en consulta para evitar traer todos los usuarios
    const administradores = await userRepository.find({
      relations: ["tipoUsuario"],
      where: { Vigente: true }
    });

    // Filtrar localmente por Rol Administrador y asegurar exclusión del principal
    const adminsANotificar = administradores.filter(user => 
      user.tipoUsuario?.Descripcion?.toLowerCase() === "administrador" &&
      user.Rut !== "21308770-3"
    );

    if (adminsANotificar.length > 0) {
      for (const admin of adminsANotificar) {
        await enviarEmailNotificacionAdminSolicitudDiaria(admin, solicitud);
      }
    }
  } catch (error) {
    console.error("Error en notificarAdminsNuevaSolicitudDiaria:", error);
  }
}
