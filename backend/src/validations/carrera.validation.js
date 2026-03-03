"use strict";
import Joi from "joi";

/**
 * Validación para crear/actualizar carrera
 */
export const carreraValidation = Joi.object({
  Nombre_Carrera: Joi.string()
    .min(5)
    .max(100)
    .required()
    .messages({
      "string.empty": "El nombre de la carrera no puede estar vacío.",
      "any.required": "El nombre de la carrera es obligatorio.",
      "string.base": "El nombre de la carrera debe ser de tipo texto.",
      "string.min": "El nombre de la carrera debe tener al menos 5 caracteres.",
      "string.max": "El nombre de la carrera debe tener como máximo 100 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para ID de carrera
 */
export const carreraIdValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID debe ser un número.",
      "number.integer": "El ID debe ser un número entero.",
      "number.positive": "El ID debe ser un número positivo.",
      "any.required": "El ID es obligatorio.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
