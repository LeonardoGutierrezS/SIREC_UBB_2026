"use strict";
import Joi from "joi";

/**
 * Validación para asignar penalización a usuario
 */
export const asignarPenalizacionValidation = Joi.object({
  Rut: Joi.string()
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7})-[\dkK]$/)
    .required()
    .messages({
      "string.empty": "El RUT no puede estar vacío.",
      "any.required": "El RUT es obligatorio.",
      "string.base": "El RUT debe ser de tipo texto.",
      "string.pattern.base": "El RUT debe tener el formato xx.xxx.xxx-x o xxxxxxxx-x.",
    }),
  ID_Penalizaciones: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de penalización debe ser un número.",
      "number.integer": "El ID de penalización debe ser un número entero.",
      "number.positive": "El ID de penalización debe ser un número positivo.",
      "any.required": "El ID de penalización es obligatorio.",
    }),
  Fecha_Inicio: Joi.date()
    .required()
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida.",
      "any.required": "La fecha de inicio es obligatoria.",
    }),
  Fecha_Fin: Joi.date()
    .allow(null)
    .messages({
      "date.base": "La fecha de fin debe ser una fecha válida.",
    }),
  Motivo_Obs: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.base": "El motivo/observación debe ser de tipo texto.",
      "string.max": "El motivo/observación debe tener como máximo 500 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para finalizar penalización
 */
export const finalizarPenalizacionValidation = Joi.object({
  Fecha_Fin: Joi.date()
    .messages({
      "date.base": "La fecha de fin debe ser una fecha válida.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
