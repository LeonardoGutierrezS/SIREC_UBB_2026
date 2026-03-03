"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad Devolución - Parte del flujo de préstamos 3FN
 * Registra la devolución de equipos prestados.
 * Flujo: Solicitud → Autorización → Préstamo → Devolución
 */
const DevolucionSchema = new EntitySchema({
  name: "Devolucion",
  tableName: "devolucion",
  columns: {
    ID_Devolucion: {
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
    Fecha_Dev: {
      type: "timestamp with time zone",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
    Hora_Dev: {
      type: "time",
      nullable: false,
    },
    Obs_Dev: {
      type: "text",
      nullable: true,
    },
    Estado_Equipo_Devolucion: {
      type: "varchar",
      length: 100,
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
      name: "IDX_DEVOLUCION",
      columns: ["ID_Devolucion"],
      unique: true,
    },
  ],
});

export default DevolucionSchema;
