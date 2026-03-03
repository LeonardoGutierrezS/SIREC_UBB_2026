"use strict";
import { EntitySchema } from "typeorm";

const EstadoSchema = new EntitySchema({
  name: "Estado",
  tableName: "estado",
  columns: {
    Cod_Estado: {
      type: "int",
      primary: true,
      generated: true,
    },
    Descripcion: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
  },
  relations: {
    tieneEstados: {
      type: "one-to-many",
      target: "TieneEstado",
      inverseSide: "estado",
    },
    equipos: {
      type: "one-to-many",
      target: "Equipos",
      inverseSide: "estado",
    },
  },
  indices: [
    {
      name: "IDX_ESTADO",
      columns: ["Cod_Estado"],
      unique: true,
    },
  ],
});

export default EstadoSchema;
