"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad PoseeCargo - Relación entre Usuario y Cargo con fechas
 * Representa el historial de cargos de un usuario profesor.
 */
const PoseeCargoSchema = new EntitySchema({
  name: "PoseeCargo",
  tableName: "posee_cargo",
  columns: {
    Rut_profesor: {
      type: "varchar",
      length: 12,
      primary: true,
    },
    ID_Cargo: {
      type: "int",
      primary: true,
    },
    Descripcion_Cargo: {
      type: "varchar",
      length: 255,
      nullable: true,
      comment: "Descripción personalizada del cargo cuando se selecciona 'Otro'",
    },
    Fecha_Inicio: {
      type: "timestamp with time zone",
      nullable: false,
    },
    Fecha_Fin: {
      type: "timestamp with time zone",
      nullable: true,
    },
  },
  relations: {
    usuario: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "Rut_profesor",
        referencedColumnName: "Rut",
      },
      nullable: false,
    },
    cargo: {
      type: "many-to-one",
      target: "Cargo",
      joinColumn: {
        name: "ID_Cargo",
      },
      nullable: false,
    },
  },
  indices: [
    {
      name: "IDX_POSEE_CARGO",
      columns: ["Rut_profesor", "ID_Cargo"],
      unique: true,
    },
  ],
});

export default PoseeCargoSchema;
