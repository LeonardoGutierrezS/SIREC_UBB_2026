"use strict";
import Joi from "joi";

/**
 * Validación para registrar devolución
 */
export const devolucionValidation = Joi.object({
  Rut: Joi.string()
    .pattern(/^[0-9]{7,8}-[0-9Kk]$/)
    .required()
    .messages({
      "string.empty": "El RUT no puede estar vacío.",
      "any.required": "El RUT es obligatorio.",
      "string.base": "El RUT debe ser de tipo texto.",
      "string.pattern.base": "El RUT debe tener el formato 12345678-9.",
    }),
  ID_Prestamo: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de préstamo debe ser un número.",
      "number.integer": "El ID de préstamo debe ser un número entero.",
      "number.positive": "El ID de préstamo debe ser un número positivo.",
      "any.required": "El ID de préstamo es obligatorio.",
    }),
  Fecha_Dev: Joi.date()
    .messages({
      "date.base": "La fecha de devolución debe ser una fecha válida.",
    }),
  Hora_Dev: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.empty": "La hora de devolución no puede estar vacía.",
      "any.required": "La hora de devolución es obligatoria.",
      "string.base": "La hora de devolución debe ser de tipo texto.",
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Obs_Dev: Joi.string()
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
