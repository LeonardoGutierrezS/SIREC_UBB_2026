"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad TienePenalizacion - Asignación de penalizaciones a usuarios
 * Registra penalizaciones activas e históricas. Actualiza automáticamente
 * el estado 'Vigente' del usuario cuando se asigna/finaliza.
 */
const TienePenalizacionSchema = new EntitySchema({
  name: "TienePenalizacion",
  tableName: "tiene_penalizacion",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    Rut: {
      type: "varchar",
      length: 12,
      nullable: false,
    },
    ID_Penalizaciones: {
      type: "int",
      nullable: false,
    },
    Fecha_Inicio: {
      type: "timestamp with time zone",
      nullable: false,
    },
    Fecha_Fin: {
      type: "timestamp with time zone",
      nullable: true,
    },
    Motivo_Obs: {
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
    penalizacion: {
      type: "many-to-one",
      target: "Penalizaciones",
      joinColumn: {
        name: "ID_Penalizaciones",
        referencedColumnName: "ID_Penalizaciones",
      },
      nullable: false,
    },
  },
  indices: [
    {
      name: "IDX_TIENE_PENALIZACION",
      columns: ["Rut", "ID_Penalizaciones"],
      unique: false,
    },
  ],
});

export default TienePenalizacionSchema;
