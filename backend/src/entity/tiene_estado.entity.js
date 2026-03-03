"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad TieneEstado - Historial de estados de préstamos
 * Registra todos los cambios de estado de un préstamo (auditoría).
 * Permite tracking completo del ciclo de vida de un préstamo.
 */
const TieneEstadoSchema = new EntitySchema({
  name: "TieneEstado",
  tableName: "tiene_estado",
  columns: {
    ID_Tiene_Estado: {
      type: "int",
      primary: true,
      generated: true,
    },
    ID_Prestamo: {
      type: "int",
      nullable: false,
    },
    Cod_Estado: {
      type: "int",
      nullable: false,
    },
    Fecha_Estado: {
      type: "timestamp with time zone",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
    Hora_Estado: {
      type: "time",
      nullable: false,
    },
    Obs_Estado: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    prestamo: {
      type: "many-to-one",
      target: "Prestamo",
      joinColumn: {
        name: "ID_Prestamo",
      },
      nullable: false,
    },
    estadoPrestamo: {
      type: "many-to-one",
      target: "EstadoPrestamo",
      joinColumn: {
        name: "Cod_Estado",
      },
      nullable: false,
    },
  },
  indices: [
    {
      name: "IDX_TIENE_ESTADO",
      columns: ["ID_Tiene_Estado"],
      unique: true,
    },
  ],
});

export default TieneEstadoSchema;
