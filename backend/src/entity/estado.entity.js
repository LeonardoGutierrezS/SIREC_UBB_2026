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
    type: "varchar",
    length: 100,
    nullable: false,
    unique: true,
    },
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