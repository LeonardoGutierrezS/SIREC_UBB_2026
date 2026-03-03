"use strict";
import { EntitySchema } from "typeorm";

const MarcaSchema = new EntitySchema({
  name: "Marca",
  tableName: "marca",
  columns: {
    ID_Marca: {
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
    equipos: {
      type: "one-to-many",
      target: "Equipos",
      inverseSide: "marca",
    },
  },
  indices: [
    {
      name: "IDX_MARCA",
      columns: ["ID_Marca"],
      unique: true,
    },
  ],
});

export default MarcaSchema;
