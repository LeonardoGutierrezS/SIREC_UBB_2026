"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad Solicitud - Parte del flujo de préstamos 3FN
 * Representa la solicitud inicial de préstamo realizada por un usuario.
 * Flujo: Solicitud → Autorización → Préstamo → Devolución
 */
const SolicitudSchema = new EntitySchema({
  name: "Solicitud",
  tableName: "solicitud",
  columns: {
    ID_Solicitud: {
      type: "int",
      primary: true,
      generated: true,
    },
    Rut: {
      type: "varchar",
      length: 12,
      nullable: false,
    },
    ID_Num_Inv: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    ID_Prestamo: {
      type: "int",
      nullable: true,
    },
    Fecha_Sol: {
      type: "timestamp with time zone",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
    Hora_Sol: {
      type: "time",
      nullable: false,
    },
    Motivo_Sol: {
      type: "text",
      nullable: true,
    },
    Fecha_inicio_sol: {
      type: "date",
      nullable: true,
    },
    Fecha_termino_sol: {
      type: "date",
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
    equipo: {
      type: "many-to-one",
      target: "Equipos",
      joinColumn: {
        name: "ID_Num_Inv",
      },
      nullable: false,
    },
    prestamo: {
      type: "many-to-one",
      target: "Prestamo",
      joinColumn: {
        name: "ID_Prestamo",
      },
      nullable: true,
    },
  },
  indices: [
    {
      name: "IDX_SOLICITUD",
      columns: ["ID_Solicitud"],
      unique: true,
    },
  ],
});

export default SolicitudSchema;
