"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad Préstamo - Simplificada en arquitectura 3FN
 * Ahora solo contiene información del préstamo activo.
 * Usuario, autorización, devolución y estados ahora son entidades separadas.
 * Flujo: Solicitud → Autorización → Préstamo → Devolución
 */
const PrestamoSchema = new EntitySchema({
  name: "Prestamo",
  tableName: "prestamo",
  columns: {
    ID_Prestamo: {
      type: "int",
      primary: true,
      generated: true,
    },
    ID_Num_Inv: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    Hora_inicio_prestamo: {
      type: "time",
      nullable: false,
    },
    Fecha_inicio_prestamo: {
      type: "timestamp with time zone",
      nullable: false,
    },
    Hora_fin_prestamo: {
      type: "time",
      nullable: true,
    },
    Fecha_fin_prestamo: {
      type: "timestamp with time zone",
      nullable: true,
    },
    Tipo_documento: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    Condiciones_Prestamo: {
      type: "text",
      nullable: true,
    },
    Documento_Suscrito: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
  relations: {
    equipos: {
      type: "many-to-one",
      target: "Equipos",
      joinColumn: {
        name: "ID_Num_Inv",
      },
      nullable: false,
    },
    solicitudes: {
      type: "one-to-many",
      target: "Solicitud",
      inverseSide: "prestamo",
    },
    devolucion: {
      type: "one-to-one",
      target: "Devolucion",
      inverseSide: "prestamo",
    },
    autorizacion: {
      type: "one-to-one",
      target: "Autorizacion",
      inverseSide: "prestamo",
    },
    tieneEstados: {
      type: "one-to-many",
      target: "TieneEstado",
      inverseSide: "prestamo",
    },
  },
  indices: [
    {
      name: "IDX_PRESTAMO",
      columns: ["ID_Prestamo"],
      unique: true,
    },
  ],
});

export default PrestamoSchema;
