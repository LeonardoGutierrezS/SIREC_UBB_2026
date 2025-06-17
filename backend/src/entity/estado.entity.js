"use strict";
import { EntitySchema } from "typeorm";

const EstadoSchema = new EntitySchema({
name: "Estado",
tableName: "estados",
columns: {
    ID_Estado: {
    type: "int",
    primary: true,
    generated: true,
    },
    Nombre: {
    type: "enum",
    enum: ["Disponible", "Prestado", "No disponible"],
    default: "Disponible",
    nullable: false,
    }
},
indices: [
    {
    name: "IDX_ESTADO",
    columns: ["ID_Estado"],
    unique: true,
    },
],
});

export default EstadoSchema;