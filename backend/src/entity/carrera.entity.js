"use strict";
import { EntitySchema } from "typeorm";

const CarreraSchema = new EntitySchema({
  name: "Carrera",
  tableName: "carrera",
  columns: {
    ID_Carrera: {
      type: "int",
      primary: true,
      generated: true,
    },
    Nombre_Carrera: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
  },
  relations: {
    poseeCarreras: {
      type: "one-to-many",
      target: "PoseeCarrera",
      inverseSide: "carrera",
    },
    users: {
      type: "one-to-many",
      target: "User",
      inverseSide: "carrera",
    },
  },
  indices: [
    {
      name: "IDX_CARRERA",
      columns: ["ID_Carrera"],
      unique: true,
    },
  ],
});

export default CarreraSchema;
