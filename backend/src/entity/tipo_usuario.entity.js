"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad TipoUsuario - Tipos de usuarios del sistema
 * Reemplaza a Rol en la nueva arquitectura 3FN.
 * Define el tipo/rol del usuario (Alumno, Profesor, Administrador, etc.)
 */
const TipoUsuarioSchema = new EntitySchema({
  name: "TipoUsuario",
  tableName: "tipousuario",
  columns: {
    Cod_TipoUsuario: {
      type: "int",
      primary: true,
      generated: true,
    },
    Descripcion: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
  },
  relations: {
    users: {
      type: "one-to-many",
      target: "User",
      inverseSide: "tipoUsuario",
    },
  },
  indices: [
    {
      name: "IDX_TIPO_USUARIO",
      columns: ["Cod_TipoUsuario"],
      unique: true,
    },
  ],
});

export default TipoUsuarioSchema;
