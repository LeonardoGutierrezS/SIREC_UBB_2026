"use strict";
import { EntitySchema } from "typeorm";

const EquiposSchema = new EntitySchema({
  name: "Equipos",
  tableName: "equipos",
  columns: {
    ID_Num_Inv: {
      type: "varchar",
      length: 50,
      primary: true,
    },
    Modelo: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    Numero_Serie: {
      type: "varchar",
      length: 100,
      nullable: false,
      unique: true,
    },
    Comentarios: {
      type: "text",
      nullable: true,
    },
    Disponible: {
      type: "boolean",
      nullable: false,
      default: true,
    },
    ID_Marca: {
      type: "int",
      nullable: false,
    },
    ID_Estado: {
      type: "int",
      nullable: false,
    },
    ID_Categoria: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    marca: {
      type: "many-to-one",
      target: "Marca",
      joinColumn: {
        name: "ID_Marca",
      },
      nullable: false,
    },
    categoria: {
      type: "many-to-one",
      target: "Categoria",
      joinColumn: {
        name: "ID_Categoria",
      },
      nullable: false,
    },
    estado: {
      type: "many-to-one",
      target: "Estado",
      joinColumn: {
        name: "ID_Estado",
        referencedColumnName: "Cod_Estado",
      },
      nullable: false,
    },
    especificaciones: {
      type: "one-to-many",
      target: "EspecificacionesHW",
      inverseSide: "equipo",
    },
    prestamos: {
      type: "one-to-many",
      target: "Prestamo",
      inverseSide: "equipos",
    },
    tieneEstados: {
      type: "one-to-many",
      target: "TieneEstado",
      inverseSide: "equipo",
    },
  },
  indices: [
    {
      name: "IDX_EQUIPOS",
      columns: ["ID_Num_Inv"],
      unique: true,
    },
    {
      name: "IDX_EQUIPOS_NUMERO_SERIE",
      columns: ["Numero_Serie"],
      unique: true,
    },
  ],
});

export default EquiposSchema;
