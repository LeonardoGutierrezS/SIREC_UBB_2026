"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad EspecificacionesHW - Especificaciones de hardware de equipos
 * Normaliza las especificaciones técnicas de los equipos en tabla separada.
 * Permite múltiples especificaciones por equipo.
 */
const EspecificacionesHWSchema = new EntitySchema({
  name: "EspecificacionesHW",
  tableName: "especificaciones_hw",
  columns: {
    ID_Especificaciones_HW: {
      type: "int",
      primary: true,
      generated: true,
    },
    ID_Num_Inv: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    Tipo_Especificacion_HW: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    Descripcion: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    equipo: {
      type: "many-to-one",
      target: "Equipos",
      joinColumn: {
        name: "ID_Num_Inv",
      },
      nullable: false,
    },
  },
  indices: [
    {
      name: "IDX_ESPECIFICACIONES_HW",
      columns: ["ID_Especificaciones_HW"],
      unique: true,
    },
  ],
});

export default EspecificacionesHWSchema;
