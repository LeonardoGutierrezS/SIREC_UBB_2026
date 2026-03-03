"use strict";
import Joi from "joi";

/**
 * Validación para crear/actualizar equipo
 */
export const equipoValidation = Joi.object({
  ID_Num_Inv: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "El número de inventario no puede estar vacío.",
      "any.required": "El número de inventario es obligatorio.",
      "string.base": "El número de inventario debe ser de tipo texto.",
      "string.min": "El número de inventario debe tener al menos 3 caracteres.",
      "string.max": "El número de inventario debe tener como máximo 50 caracteres.",
    }),
  Modelo: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "El modelo no puede estar vacío.",
      "any.required": "El modelo es obligatorio.",
      "string.base": "El modelo debe ser de tipo texto.",
      "string.min": "El modelo debe tener al menos 2 caracteres.",
      "string.max": "El modelo debe tener como máximo 100 caracteres.",
    }),
  Numero_Serie: Joi.string()
    .min(5)
    .max(100)
    .required()
    .messages({
      "string.empty": "El número de serie no puede estar vacío.",
      "any.required": "El número de serie es obligatorio.",
      "string.base": "El número de serie debe ser de tipo texto.",
      "string.min": "El número de serie debe tener al menos 5 caracteres.",
      "string.max": "El número de serie debe tener como máximo 100 caracteres.",
    }),
  Comentarios: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.base": "Los comentarios deben ser de tipo texto.",
      "string.max": "Los comentarios deben tener como máximo 500 caracteres.",
    }),
  Disponible: Joi.boolean()
    .messages({
      "boolean.base": "Disponible debe ser verdadero o falso.",
    }),
  ID_Marca: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de marca debe ser un número.",
      "number.integer": "El ID de marca debe ser un número entero.",
      "number.positive": "El ID de marca debe ser un número positivo.",
      "any.required": "El ID de marca es obligatorio.",
    }),
  ID_Categoria: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de categoría debe ser un número.",
      "number.integer": "El ID de categoría debe ser un número entero.",
      "number.positive": "El ID de categoría debe ser un número positivo.",
      "any.required": "El ID de categoría es obligatorio.",
    }),
  ID_Estado: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de estado debe ser un número.",
      "number.integer": "El ID de estado debe ser un número entero.",
      "number.positive": "El ID de estado debe ser un número positivo.",
      "any.required": "El ID de estado es obligatorio.",
    }),
  especificaciones: Joi.object({
    Procesador: Joi.string()
      .max(200)
      .allow(null, "")
      .messages({
        "string.base": "El procesador debe ser de tipo texto.",
        "string.max": "El procesador debe tener como máximo 200 caracteres.",
      }),
    RAM: Joi.string()
      .max(100)
      .allow(null, "")
      .messages({
        "string.base": "La RAM debe ser de tipo texto.",
        "string.max": "La RAM debe tener como máximo 100 caracteres.",
      }),
    Almacenamiento: Joi.string()
      .max(100)
      .allow(null, "")
      .messages({
        "string.base": "El almacenamiento debe ser de tipo texto.",
        "string.max": "El almacenamiento debe tener como máximo 100 caracteres.",
      }),
  })
    .optional()
    .messages({
      "object.base": "Las especificaciones deben ser un objeto.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar equipo (campos opcionales)
 */
export const equipoUpdateValidation = Joi.object({
  Modelo: Joi.string()
    .min(2)
    .max(100)
    .messages({
      "string.empty": "El modelo no puede estar vacío.",
      "string.base": "El modelo debe ser de tipo texto.",
      "string.min": "El modelo debe tener al menos 2 caracteres.",
      "string.max": "El modelo debe tener como máximo 100 caracteres.",
    }),
  Numero_Serie: Joi.string()
    .min(5)
    .max(100)
    .messages({
      "string.empty": "El número de serie no puede estar vacío.",
      "string.base": "El número de serie debe ser de tipo texto.",
      "string.min": "El número de serie debe tener al menos 5 caracteres.",
      "string.max": "El número de serie debe tener como máximo 100 caracteres.",
    }),
  Comentarios: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.base": "Los comentarios deben ser de tipo texto.",
      "string.max": "Los comentarios deben tener como máximo 500 caracteres.",
    }),
  Disponible: Joi.boolean()
    .messages({
      "boolean.base": "Disponible debe ser verdadero o falso.",
    }),
  ID_Marca: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID de marca debe ser un número.",
      "number.integer": "El ID de marca debe ser un número entero.",
      "number.positive": "El ID de marca debe ser un número positivo.",
    }),
  ID_Categoria: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID de categoría debe ser un número.",
      "number.integer": "El ID de categoría debe ser un número entero.",
      "number.positive": "El ID de categoría debe ser un número positivo.",
    }),
  ID_Estado: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID de estado debe ser un número.",
      "number.integer": "El ID de estado debe ser un número entero.",
      "number.positive": "El ID de estado debe ser un número positivo.",
    }),
  especificaciones: Joi.object({
    Procesador: Joi.string()
      .max(200)
      .allow(null, "")
      .messages({
        "string.base": "El procesador debe ser de tipo texto.",
        "string.max": "El procesador debe tener como máximo 200 caracteres.",
      }),
    RAM: Joi.string()
      .max(100)
      .allow(null, "")
      .messages({
        "string.base": "La RAM debe ser de tipo texto.",
        "string.max": "La RAM debe tener como máximo 100 caracteres.",
      }),
    Almacenamiento: Joi.string()
      .max(100)
      .allow(null, "")
      .messages({
        "string.base": "El almacenamiento debe ser de tipo texto.",
        "string.max": "El almacenamiento debe tener como máximo 100 caracteres.",
      }),
  })
    .optional()
    .messages({
      "object.base": "Las especificaciones deben ser un objeto.",
    }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.min": "Debes proporcionar al menos un campo para actualizar.",
  });
