"use strict";
import { EntitySchema } from "typeorm";

const UserSchema = new EntitySchema({
  name: "User",
  tableName: "usuario",
  columns: {
    Rut: {
      type: "varchar",
      length: 12,
      primary: true,
    },
    Nombre_Completo: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    Correo: {
      type: "varchar",
      length: 100,
      nullable: false,
      unique: true,
    },
    Contrasenia: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    Vigente: {
      type: "boolean",
      nullable: false,
      default: true,
    },
    Aprobado: {
      type: "boolean",
      nullable: false,
      default: false,
    },
    ID_Cargo: {
      type: "int",
      nullable: true,
    },
    ID_Carrera: {
      type: "int",
      nullable: true,
    },
    Cod_TipoUsuario: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    cargo: {
      type: "many-to-one",
      target: "Cargo",
      joinColumn: {
        name: "ID_Cargo",
      },
      nullable: true,
    },
    carrera: {
      type: "many-to-one",
      target: "Carrera",
      joinColumn: {
        name: "ID_Carrera",
      },
      nullable: true,
    },
    tipoUsuario: {
      type: "many-to-one",
      target: "TipoUsuario",
      joinColumn: {
        name: "Cod_TipoUsuario",
      },
      nullable: false,
    },
    solicitudes: {
      type: "one-to-many",
      target: "Solicitud",
      inverseSide: "usuario",
    },
    devoluciones: {
      type: "one-to-many",
      target: "Devolucion",
      inverseSide: "usuario",
    },
    autorizaciones: {
      type: "one-to-many",
      target: "Autorizacion",
      inverseSide: "usuario",
    },
    penalizaciones: {
      type: "one-to-many",
      target: "TienePenalizacion",
      inverseSide: "usuario",
    },
    poseesCargos: {
      type: "one-to-many",
      target: "PoseeCargo",
      inverseSide: "usuario",
    },
    poseesCarreras: {
      type: "one-to-many",
      target: "PoseeCarrera",
      inverseSide: "usuario",
    },
  },
  indices: [
    {
      name: "IDX_USUARIO_RUT",
      columns: ["Rut"],
      unique: true,
    },
    {
      name: "IDX_USUARIO_CORREO",
      columns: ["Correo"],
      unique: true,
    },
  ],
});

export default UserSchema;