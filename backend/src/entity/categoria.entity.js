"use strict";
import { EntitySchema } from "typeorm";

/**
 * @note Esta entidad sigue en uso para clasificación de equipos.
 * Se mantiene activa en la arquitectura actual.
 */
const CategoriaSchema = new EntitySchema({
  name: "Categoria",
  tableName: "categoria",
  columns: {
    ID_Categoria: {
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
      inverseSide: "categoria",
    },
  },
  indices: [
    {
      name: "IDX_CATEGORIA",
      columns: ["ID_Categoria"],
      unique: true,
    },
  ],
});

export default CategoriaSchema;
