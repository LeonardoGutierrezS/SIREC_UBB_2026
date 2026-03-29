"use strict";
import {
  approveUserService,
  createUserByAdminService,
  deleteUserService,
  getPendingUsersService,
  getUserService,
  getUsersService,
  rejectUserService,
  updateUserService,
  updateUserStatusService,
} from "../services/user.service.js";
import { 
  enviarEmailUsuarioAprobado, 
  enviarEmailUsuarioRechazado,
  enviarEmailCredencialesProvisorias
} from "../services/email.service.js";
import { FRONTEND_URL } from "../config/configEnv.js";
import {
  userBodyValidation,
  userQueryValidation,
} from "../validations/user.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getUser(req, res) {
  try {
    const { rut, email } = req.query;

    const { error } = userQueryValidation.validate({ rut, email });

    if (error) return handleErrorClient(res, 400, error.message);

    const [user, errorUser] = await getUserService({ rut, email });

    if (errorUser) return handleErrorClient(res, 404, errorUser);

    handleSuccess(res, 200, "Usuario encontrado", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getUsers(req, res) {
  try {
    const [users, errorUsers] = await getUsersService();

    if (errorUsers) return handleErrorClient(res, 404, errorUsers);

    users.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Usuarios encontrados", users);
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

export async function updateUser(req, res) {
  try {
    const { rut, email } = req.query;
    const { body } = req;

    const { error: queryError } = userQueryValidation.validate({
      rut,
      email,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const { error: bodyError } = userBodyValidation.validate(body);

    if (bodyError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en los datos enviados",
        bodyError.message,
      );
    }

    // Seguridad: Si no es administrador, solo puede editar su propio perfil
    const currentUser = req.user;
    const isAdminUser = currentUser.tipoUsuario?.toLowerCase() === "administrador";

    if (!isAdminUser) {
      // Validar que el RUT o Email consultado sea el del usuario autenticado
      if (rut !== currentUser.rut && email !== currentUser.email) {
        return handleErrorClient(
          res,
          403,
          "No autorizado",
          "No tienes permiso para modificar la información de otro usuario.",
        );
      }

      // Impedir que un usuario no-admin cambie campos sensibles
      const forbiddenFields = ["codTipoUsuario", "vigente", "aprobado", "idCargo", "idCarrera", "rol"];
      for (const field of forbiddenFields) {
        if (body[field] !== undefined) {
          return handleErrorClient(
            res,
            403,
            "Acción no permitida",
            `No tienes permisos para modificar el campo: ${field}`,
          );
        }
      }
    } else {
      // SI es administrador, y se está editando a sí mismo, bloquear campos sensibles para evitar auto-sabotaje
      if (rut === currentUser.rut || email === currentUser.email) {
        const forbiddenFieldsForSelfAdmin = ["codTipoUsuario", "vigente", "aprobado", "idCargo", "idCarrera", "rol"];
        for (const field of forbiddenFieldsForSelfAdmin) {
          if (body[field] !== undefined) {
            return handleErrorClient(
              res,
              403,
              "Acción no permitida",
              `No puedes modificar tus propios privilegios o estado (campo: ${field})`
            );
          }
        }
      }
    }

    const [user, userError] = await updateUserService({ rut, email }, body);

    if (userError) {
      return handleErrorClient(res, 400, "Error modificando al usuario", userError);
    }

    handleSuccess(res, 200, "Usuario modificado correctamente", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteUser(req, res) {
  try {
    const { rut, email } = req.query;
    const currentUser = req.user;

    if (rut === currentUser.rut || email === currentUser.email) {
      return handleErrorClient(res, 403, "Acción no permitida", "No puedes eliminar tu propia cuenta de administrador.");
    }

    const { error: queryError } = userQueryValidation.validate({
      rut,
      email,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [userDelete, errorUserDelete] = await deleteUserService({
      rut,
      email,
    });

    if (errorUserDelete) return handleErrorClient(res, 404, "Error eliminado al usuario", errorUserDelete);

    handleSuccess(res, 200, "Usuario eliminado correctamente", userDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAllUsers(req, res) {
  try {
    const [users, errorUsers] = await getUsersService();

    if (errorUsers) return handleErrorClient(res, 404, errorUsers);

    handleSuccess(res, 200, "Usuarios encontrados", users);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getPendingUsers(req, res) {
  try {
    const [users, error] = await getPendingUsersService();

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Usuarios pendientes encontrados", users);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function approveUser(req, res) {
  try {
    const { rut } = req.params;
    const [user, error] = await approveUserService(rut);

    if (error) return handleErrorClient(res, 400, "Error al aprobar usuario", error);

    // Enviar correo de aprobación
    await enviarEmailUsuarioAprobado(user);

    handleSuccess(res, 200, "Usuario aprobado correctamente", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function rejectUser(req, res) {
  try {
    const { rut } = req.params;
    const { motivo } = req.body;

    if (!motivo || motivo.trim().length === 0) {
      return handleErrorClient(res, 400, "Error al rechazar usuario", "El motivo de rechazo es obligatorio");
    }

    const [user, error] = await rejectUserService(rut, motivo);

    if (error) return handleErrorClient(res, 400, "Error al rechazar usuario", error);

    // Enviar correo de rechazo
    await enviarEmailUsuarioRechazado(user, motivo);

    handleSuccess(res, 200, "Usuario rechazado correctamente", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { rut } = req.params;
    const { vigente } = req.body;
    const currentUser = req.user;

    if (rut === currentUser.rut) {
      return handleErrorClient(res, 403, "Acción no permitida", "No puedes cambiar el estado de tu propia cuenta.");
    }

    const [user, error] = await updateUserStatusService(rut, vigente);

    if (error) return handleErrorClient(res, 400, "Error al actualizar estado", error);

    handleSuccess(res, 200, "Estado actualizado correctamente", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createUserByAdmin(req, res) {
  try {
    const { body } = req;
    
    // Validar el body con Joi antes de llamar al servicio
    const { error: bodyError } = userBodyValidation.validate(body);
    if (bodyError) {
      return handleErrorClient(
        res, 
        400, 
        "Error de validación en los datos del usuario", 
        bodyError.message
      );
    }

    const [newUser, error] = await createUserByAdminService(body);

    if (error) return handleErrorClient(res, 400, "Error al crear usuario", error);

    // Enviar correo con contraseña provisional
    await enviarEmailCredencialesProvisorias(newUser);

    // Remover la contraseña provisional de la respuesta
    const { provisionalPassword, ...userWithoutPassword } = newUser;

    handleSuccess(res, 201, "Usuario creado correctamente. Se ha enviado un correo con las credenciales.", 
      userWithoutPassword);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}