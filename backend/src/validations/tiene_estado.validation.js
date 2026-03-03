"use strict";
import Joi from "joi";

/**
 * Validación para crear registro de estado
 */
export const tieneEstadoValidation = Joi.object({
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
  ID_Estado: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de estado de préstamo debe ser un número.",
      "number.integer": "El ID de estado de préstamo debe ser un número entero.",
      "number.positive": "El ID de estado de préstamo debe ser un número positivo.",
      "any.required": "El ID de estado de préstamo es obligatorio.",
    }),
  Cod_Estado: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El código de estado debe ser un número.",
      "number.integer": "El código de estado debe ser un número entero.",
      "number.positive": "El código de estado debe ser un número positivo.",
      "any.required": "El código de estado es obligatorio.",
    }),
  Fecha_Estado: Joi.date()
    .required()
    .messages({
      "date.base": "La fecha de estado debe ser una fecha válida.",
      "any.required": "La fecha de estado es obligatoria.",
    }),
  Hora_Estado: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.empty": "La hora de estado no puede estar vacía.",
      "any.required": "La hora de estado es obligatoria.",
      "string.base": "La hora de estado debe ser de tipo texto.",
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Obs_Estado: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.base": "Las observaciones deben ser de tipo texto.",
      "string.max": "Las observaciones deben tener como máximo 500 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
