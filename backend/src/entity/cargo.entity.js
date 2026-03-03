"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad Cargo - Cargos/Posiciones de usuarios
 * Define el cargo o posición laboral/académica del usuario.
 */
const CargoSchema = new EntitySchema({
  name: "Cargo",
  tableName: "cargo",
  columns: {
    ID_Cargo: {
      type: "int",
      primary: true,
      generated: true,
    },
    Desc_Cargo: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
  },
  relations: {
    poseesCargos: {
      type: "one-to-many",
      target: "PoseeCargo",
      inverseSide: "cargo",
    },
    users: {
      type: "one-to-many",
      target: "User",
      inverseSide: "cargo",
    },
  },
  indices: [
    {
      name: "IDX_CARGO",
      columns: ["ID_Cargo"],
      unique: true,
    },
  ],
});

export default CargoSchema;
