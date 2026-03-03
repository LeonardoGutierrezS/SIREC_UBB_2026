"use strict";
import { EntitySchema } from "typeorm";

/**
 * @deprecated Esta entidad está siendo reemplazada por TieneEstado (tiene_estado)
 * en la nueva arquitectura 3FN. Se mantiene por compatibilidad con código legacy.
 * TODO: Migrar servicios y middlewares para usar TieneEstado
 */
const EstadoPrestamoSchema = new EntitySchema({
  name: "EstadoPrestamo",
  tableName: "estado_prestamo",
  columns: {
    ID_Estado: {
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
      inverseSide: "estadoPrestamo",
    },
  },
  indices: [
    {
      name: "IDX_ESTADO_PRESTAMO",
      columns: ["ID_Estado"],
      unique: true,
    },
  ],
});

export default EstadoPrestamoSchema;
