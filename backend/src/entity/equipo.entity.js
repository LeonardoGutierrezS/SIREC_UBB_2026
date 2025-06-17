"use strict";
import { EntitySchema } from "typeorm";

const EquipoSchema = new EntitySchema({
name: "Equipo",
tableName: "equipos",
columns: {
    ID_Equipo: {
    type: "int",
    primary: true,
    generated: true,
    },
    Modelo: {
    type: "varchar",
    length: 255,
    nullable: false,
    },
    Tipo: {
    type: "varchar",
    length: 100,
    nullable: false,
    },
    ID_Estado: {
    type: "int",
    nullable: false,
    },
    Condicion: {
    type: "varchar",
    length: 100,
    nullable: false,
    },
    Propietario: {
    type: "varchar",
    length: 255,
    nullable: false,
    },
    Fecha_Alta_LAB: {
    type: "date",
    nullable: true,
    },
    Fecha_Baja_LAB: {
    type: "date",
    nullable: true,
    },
},
indices: [
    {
    name: "IDX_EQUIPO",
    columns: ["ID_Equipo"],
    unique: true,
    },
],
relations: {
    estado: {
    type: "many-to-one",
    target: "Estado",
    joinColumn: { name: "ID_Estado" },
    },
},
});