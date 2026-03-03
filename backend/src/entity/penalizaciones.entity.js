"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad Penalizaciones - Catálogo de tipos de penalizaciones
 * Define los tipos de penalizaciones disponibles en el sistema.
 */
const PenalizacionesSchema = new EntitySchema({
  name: "Penalizaciones",
  tableName: "penalizaciones",
  columns: {
    ID_Penalizaciones: {
      type: "int",
      primary: true,
      generated: true,
    },
    Descripcion: {
      type: "text",
      nullable: false,
    },
    Dias_Sancion: {
      type: "int",
      nullable: false,
      default: 0,
    },
  },
  relations: {
    tienePenalizaciones: {
      type: "one-to-many",
      target: "TienePenalizacion",
      inverseSide: "penalizacion",
    },
  },
  indices: [
    {
      name: "IDX_PENALIZACIONES",
      columns: ["ID_Penalizaciones"],
      unique: true,
    },
  ],
});

export default PenalizacionesSchema;
