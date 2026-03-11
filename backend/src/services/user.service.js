"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { IsNull } from "typeorm";

export async function getUserService(query) {
  try {
    const { rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ Rut: rut }, { Correo: email }],
      relations: ["tipoUsuario", "carrera", "cargo", "poseesCargos", "poseesCargos.cargo"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    const { Contrasenia, ...userData } = userFound;
    
    // Filtrar solo el cargo activo
    const cargoActivo = userData.poseesCargos?.find(pc => pc.Fecha_Fin === null);
    userData.poseesCargos = cargoActivo ? [cargoActivo] : [];

    return [userData, null];
  } catch (error) {
    console.error("Error obtener el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getUsersService() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const users = await userRepository.find({
      relations: ["tipoUsuario", "carrera", "cargo", "poseesCargos", "poseesCargos.cargo"],
    });

    if (!users || users.length === 0) return [null, "No hay usuarios"];

    // Filtrar solo los cargos activos (Fecha_Fin null) en poseesCargos
    const usersData = users.map(({ Contrasenia, ...user }) => {
      const cargoActivo = user.poseesCargos?.find(pc => pc.Fecha_Fin === null);
      return {
        ...user,
        poseesCargos: cargoActivo ? [cargoActivo] : []
      };
    });

    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener a los usuarios:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateUserService(query, body) {
  try {
    const { rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);
    const TipoUsuarioSchema = AppDataSource.getRepository("TipoUsuario");
    const CargoSchema = AppDataSource.getRepository("Cargo");
    const CarreraSchema = AppDataSource.getRepository("Carrera");
    const PoseeCargoSchema = AppDataSource.getRepository("PoseeCargo");

    const userFound = await userRepository.findOne({
      where: [{ Rut: rut }, { Correo: email }],
      relations: ["tipoUsuario", "carrera", "cargo"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (body.rut) {
      const existingRut = await userRepository.findOne({ where: { Rut: body.rut } });
      if (existingRut && existingRut.Rut !== userFound.Rut) {
        return [null, "El RUT ingresado ya está registrado para otro usuario"];
      }
    }

    if (body.email) {
      const existingEmail = await userRepository.findOne({ where: { Correo: body.email } });
      if (existingEmail && existingEmail.Rut !== userFound.Rut) {
        return [null, "El correo electrónico ingresado ya está registrado para otro usuario"];
      }
    }

    if (body.password) {
      const matchPassword = await comparePassword(
        body.password,
        userFound.Contrasenia,
      );

      if (!matchPassword) return [null, "La contraseña no coincide"];
    }

    // Actualizar campos básicos
    if (body.nombreCompleto) {
      userFound.Nombre_Completo = body.nombreCompleto.trim();
    }
    if (body.rut && body.rut !== userFound.Rut) {
      // No se puede cambiar el RUT ya que es PK
      return [null, "No se puede cambiar el RUT del usuario"];
    }
    if (body.email) userFound.Correo = body.email;
    if (body.vigente !== undefined) userFound.Vigente = body.vigente;

    // Actualizar tipo de usuario si se proporciona
    if (body.codTipoUsuario !== undefined) {
      const tipoUsuario = await TipoUsuarioSchema.findOne({ where: { Cod_TipoUsuario: body.codTipoUsuario } });
      if (!tipoUsuario) return [null, "Tipo de usuario no encontrado"];
      userFound.Cod_TipoUsuario = tipoUsuario.Cod_TipoUsuario;
    }

    // Validar requisitos según tipo de usuario
    const tipoUsuarioFinal = body.codTipoUsuario || userFound.Cod_TipoUsuario;
    
    // Alumno (2) requiere carrera obligatoriamente
    if (tipoUsuarioFinal === 2) {
      const carreraFinal = body.idCarrera !== undefined ? body.idCarrera : userFound.ID_Carrera;
      if (!carreraFinal || carreraFinal === null || carreraFinal === "") {
        return [null, "Los alumnos deben tener una carrera asignada"];
      }
    }
    
    // Profesor (3) requiere cargo obligatoriamente
    if (tipoUsuarioFinal === 3) {
      const cargoFinal = body.idCargo !== undefined ? body.idCargo : userFound.ID_Cargo;
      if (!cargoFinal || cargoFinal === null) {
        return [null, "Los profesores deben tener un cargo asignado"];
      }
    }

    // Actualizar cargo si se proporciona
    if (body.idCargo !== undefined) {
      const cargoAnterior = userFound.ID_Cargo;
      
      if (body.idCargo === null) {
        // Solo permitir nulo si no es profesor
        if (tipoUsuarioFinal === 3) {
          return [null, "No se puede quitar el cargo a un profesor"];
        }
        
        // Cerrar el cargo actual si existe
        if (cargoAnterior) {
          await PoseeCargoSchema.update(
            { Rut_profesor: userFound.Rut, ID_Cargo: cargoAnterior, Fecha_Fin: IsNull() },
            { Fecha_Fin: new Date() }
          );
        }
        
        userFound.ID_Cargo = null;
        userFound.cargo = null;
      } else {
        const cargo = await CargoSchema.findOne({ where: { ID_Cargo: body.idCargo } });
        if (!cargo) return [null, "Cargo no encontrado"];
        
        // Si cambió el cargo, cerrar el anterior y crear uno nuevo
        if (cargoAnterior !== body.idCargo) {
          // Cerrar cargo anterior si existe
          if (cargoAnterior) {
            await PoseeCargoSchema.update(
              { Rut_profesor: userFound.Rut, ID_Cargo: cargoAnterior, Fecha_Fin: IsNull() },
              { Fecha_Fin: new Date() }
            );
          }
          
          // Crear nuevo registro en posee_cargo
          const nuevoPoseeCargo = PoseeCargoSchema.create({
            Rut_profesor: userFound.Rut,
            ID_Cargo: body.idCargo,
            Fecha_Inicio: new Date(),
            Fecha_Fin: null,
            Descripcion_Cargo: body.descripcionCargo || null
          });
          
          await PoseeCargoSchema.save(nuevoPoseeCargo);
        } else if (body.descripcionCargo !== undefined) {
          // Si no cambió el cargo pero sí la descripción, actualizar
          await PoseeCargoSchema.update(
            { Rut_profesor: userFound.Rut, ID_Cargo: body.idCargo, Fecha_Fin: IsNull() },
            { Descripcion_Cargo: body.descripcionCargo || null }
          );
        }
        userFound.ID_Cargo = cargo.ID_Cargo;
        userFound.cargo = cargo; // Forzar actualización de la relación completa
      }
    }

    // Actualizar carrera si se proporciona
    if (body.idCarrera !== undefined) {
      if (body.idCarrera === null || body.idCarrera === "") {
        // Solo permitir nulo si no es alumno
        if (tipoUsuarioFinal === 2) {
          return [null, "No se puede quitar la carrera a un alumno"];
        }
        userFound.ID_Carrera = null;
        userFound.carrera = null;
      } else {
        const carrera = await CarreraSchema.findOne({ where: { ID_Carrera: body.idCarrera } });
        if (!carrera) return [null, "Carrera no encontrada"];
        userFound.ID_Carrera = carrera.ID_Carrera;
        userFound.carrera = carrera; // Forzar actualización de la relación completa
      }
    }

    // Actualizar contraseña si se proporciona una nueva
    if (body.newPassword && body.newPassword.trim() !== "") {
      userFound.Contrasenia = await encryptPassword(body.newPassword);
    }

    // Guardar los cambios
    const savedUser = await userRepository.save(userFound);

    // Recargar el usuario con las relaciones
    const userData = await userRepository.findOne({
      where: { Rut: savedUser.Rut },
      relations: ["tipoUsuario", "carrera", "cargo", "poseesCargos", "poseesCargos.cargo"],
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }

    // Filtrar solo el cargo activo
    const cargoActivo = userData.poseesCargos?.find(pc => pc.Fecha_Fin === null);
    userData.poseesCargos = cargoActivo ? [cargoActivo] : [];

    const { Contrasenia, ...userUpdated } = userData;

    return [userUpdated, null];
  } catch (error) {
    console.error("Error al modificar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteUserService(query) {
  try {
    const { rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ Rut: rut }, { Correo: email }],
      relations: ["tipoUsuario"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.tipoUsuario && userFound.tipoUsuario.Descripcion === "Administrador") {
      return [null, "No se puede eliminar un usuario con tipo Administrador"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { Contrasenia, ...dataUser } = userDeleted;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getPendingUsersService() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const pendingUsers = await userRepository.find({
      where: { Aprobado: false },
      relations: ["tipoUsuario", "carrera", "cargo"],
    });

    if (!pendingUsers || pendingUsers.length === 0) return [[], null];

    const usersData = pendingUsers.map(({ Contrasenia, ...user }) => user);

    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener usuarios pendientes:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function approveUserService(rut) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: { Rut: rut },
      relations: ["tipoUsuario", "carrera", "cargo"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.Aprobado) return [null, "El usuario ya está aprobado"];

    await userRepository.update({ Rut: rut }, { Vigente: true, Aprobado: true });

    const userUpdated = await userRepository.findOne({
      where: { Rut: rut },
      relations: ["tipoUsuario", "carrera", "cargo"],
    });

    const { Contrasenia, ...userData } = userUpdated;

    return [userData, null];
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function rejectUserService(rut, motivo) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: { Rut: rut },
      relations: ["tipoUsuario"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.Vigente) return [null, "No se puede rechazar un usuario ya aprobado"];

    if (userFound.tipoUsuario && userFound.tipoUsuario.Descripcion === "Administrador") {
      return [null, "No se puede rechazar un usuario con tipo Administrador"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { Contrasenia, ...dataUser } = userDeleted;

    return [{ ...dataUser, motivo }, null];
  } catch (error) {
    console.error("Error al rechazar usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateUserStatusService(rut, vigente) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: { Rut: rut },
      relations: ["tipoUsuario"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.tipoUsuario && userFound.tipoUsuario.Descripcion === "Administrador") {
      return [null, "No se puede cambiar el estado de un administrador"];
    }

    await userRepository.update(
      { Rut: rut },
      { Vigente: vigente }
    );

    const userUpdated = await userRepository.findOne({
      where: { Rut: rut },
      relations: ["tipoUsuario", "carrera", "cargo"],
    });

    const { Contrasenia, ...userData } = userUpdated;

    return [userData, null];
  } catch (error) {
    console.error("Error al actualizar estado de usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createUserByAdminService(data) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const TipoUsuarioSchema = AppDataSource.getRepository("TipoUsuario");
    const CargoSchema = AppDataSource.getRepository("Cargo");
    const CarreraSchema = AppDataSource.getRepository("Carrera");

    // Verificar si el RUT o el correo ya existen (en paralelo)
    const [existingRut, existingEmail] = await Promise.all([
      userRepository.findOne({ where: { Rut: data.rut } }),
      userRepository.findOne({ where: { Correo: data.email } })
    ]);

    const errors = {};
    if (existingRut) errors.rut = "El RUT ingresado ya está registrado";
    if (existingEmail) errors.email = "El correo electrónico ingresado ya está registrado";

    if (Object.keys(errors).length > 0) {
      return [null, errors];
    }

    // Validar que el tipo de usuario exista
    const tipoUsuario = await TipoUsuarioSchema.findOne({ 
      where: { Cod_TipoUsuario: data.codTipoUsuario } 
    });
    if (!tipoUsuario) return [null, "Tipo de usuario no encontrado"];

    // Validar que el cargo exista si se proporciona
    if (data.idCargo) {
      const cargo = await CargoSchema.findOne({ where: { ID_Cargo: data.idCargo } });
      if (!cargo) return [null, "Cargo no encontrado"];
    }

    // Validar que la carrera exista si se proporciona
    if (data.idCarrera) {
      const carrera = await CarreraSchema.findOne({ where: { ID_Carrera: data.idCarrera } });
      if (!carrera) return [null, "Carrera no encontrada"];
    }

    // Generar contraseña provisional automática (8 caracteres: letras, números y símbolos opcionales)
    const generatePassword = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
      let password = "";
      // Asegurar al menos una mayúscula, una minúscula y un número
      password += "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)];
      password += "abcdefghijkmnpqrstuvwxyz"[Math.floor(Math.random() * 23)];
      password += "23456789"[Math.floor(Math.random() * 8)];
      // Completar con caracteres aleatorios
      for (let i = 0; i < 5; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      // Mezclar caracteres
      return password.split("").sort(() => Math.random() - 0.5).join("");
    };

    const provisionalPassword = generatePassword();

    // Encriptar contraseña
    const hashedPassword = await encryptPassword(provisionalPassword);

    // Crear nuevo usuario
    const newUser = userRepository.create({
      Rut: data.rut,
      Nombre_Completo: data.nombreCompleto,
      Correo: data.email,
      Contrasenia: hashedPassword,
      Vigente: true, // Usuarios creados por admin se aprueban automáticamente
      Aprobado: true,
      Cod_TipoUsuario: data.codTipoUsuario,
      ID_Cargo: data.idCargo || null,
      ID_Carrera: data.idCarrera || null,
    });

    await userRepository.save(newUser);

    // Si es profesor (tipo 3) y tiene cargo, crear registro en posee_cargo
    if (data.codTipoUsuario === 3 && data.idCargo) {
      const PoseeCargoRepository = AppDataSource.getRepository("PoseeCargo");
      const nuevoPoseeCargo = PoseeCargoRepository.create({
        Rut_profesor: newUser.Rut,
        ID_Cargo: data.idCargo,
        Fecha_Inicio: new Date(),
        Fecha_Fin: null,
        Descripcion_Cargo: data.descripcionCargo || null
      });
      await PoseeCargoRepository.save(nuevoPoseeCargo);
    }

    const userCreated = await userRepository.findOne({
      where: { Rut: newUser.Rut },
      relations: ["tipoUsuario", "carrera", "cargo"],
    });

    // Retornar también la contraseña provisional para enviarla por correo
    const { Contrasenia, ...userData } = userCreated;

    return [{ ...userData, provisionalPassword }, null];
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return [null, "Error interno del servidor"];
  }
}