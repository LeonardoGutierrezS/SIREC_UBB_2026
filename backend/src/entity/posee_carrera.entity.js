"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad PoseeCarrera - Relación entre Usuario y Carrera con año de ingreso
 * Representa la carrera del estudiante y su año de ingreso.
 */
const PoseeCarreraSchema = new EntitySchema({
  name: "PoseeCarrera",
  tableName: "posee_carrera",
  columns: {
    Rut_profesor: {
      type: "varchar",
      length: 12,
      primary: true,
    },
    ID_Carrera: {
      type: "int",
      primary: true,
    },
    Anio_Ingreso: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    usuario: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "Rut_profesor",
        referencedColumnName: "Rut",
      },
      nullable: false,
    },
    carrera: {
      type: "many-to-one",
      target: "Carrera",
      joinColumn: {
        name: "ID_Carrera",
      },
      nullable: false,
    },
  },
  indices: [
    {
      name: "IDX_POSEE_CARRERA",
      columns: ["Rut_profesor", "ID_Carrera"],
      unique: true,
    },
  ],
});

export default PoseeCarreraSchema;
