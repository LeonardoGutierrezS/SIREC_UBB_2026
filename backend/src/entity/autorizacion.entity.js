"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad Autorización - Parte del flujo de préstamos 3FN
 * Registra la aprobación o rechazo de una solicitud por un administrador.
 * Flujo: Solicitud → Autorización → Préstamo → Devolución
 */
const AutorizacionSchema = new EntitySchema({
  name: "Autorizacion",
  tableName: "autorizacion",
  columns: {
    ID_Autorizacion: {
      type: "int",
      primary: true,
      generated: true,
    },
    Rut: {
      type: "varchar",
      length: 12,
      nullable: false,
    },
    ID_Prestamo: {
      type: "int",
      nullable: false,
    },
    Fecha_Aut: {
      type: "timestamp with time zone",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
    Hora_Aut: {
      type: "time",
      nullable: false,
    },
    Obs_Aut: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    usuario: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "Rut",
        referencedColumnName: "Rut",
      },
      nullable: false,
    },
    prestamo: {
      type: "one-to-one",
      target: "Prestamo",
      joinColumn: {
        name: "ID_Prestamo",
      },
      nullable: false,
    },
  },
  indices: [
    {
      name: "IDX_AUTORIZACION",
      columns: ["ID_Autorizacion"],
      unique: true,
    },
  ],
});

export default AutorizacionSchema;
