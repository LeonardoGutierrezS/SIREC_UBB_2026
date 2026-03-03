"use strict";
import Joi from "joi";

/**
 * Validación para asignar un cargo a un usuario
 */
export const poseeCargoValidation = Joi.object({
  Rut_profesor: Joi.string()
    .pattern(/^[0-9]{7,8}-[0-9Kk]$/)
    .required()
    .messages({
      "string.empty": "El RUT no puede estar vacío.",
      "any.required": "El RUT es obligatorio.",
      "string.base": "El RUT debe ser de tipo texto.",
      "string.pattern.base": "El RUT debe tener el formato 12345678-9.",
    }),
  ID_Cargo: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de cargo debe ser un número.",
      "number.integer": "El ID de cargo debe ser un número entero.",
      "number.positive": "El ID de cargo debe ser un número positivo.",
      "any.required": "El ID de cargo es obligatorio.",
    }),
  Fecha_Inicio: Joi.date()
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida.",
    }),
  Fecha_Fin: Joi.date()
    .allow(null)
    .messages({
      "date.base": "La fecha de fin debe ser una fecha válida.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para finalizar un cargo
 */
export const finalizarCargoValidation = Joi.object({
  Fecha_Fin: Joi.date()
    .required()
    .messages({
      "date.base": "La fecha de fin debe ser una fecha válida.",
      "any.required": "La fecha de fin es obligatoria.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
