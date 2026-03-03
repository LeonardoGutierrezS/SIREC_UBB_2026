"use strict";
import Joi from "joi";

/**
 * Validación para crear o actualizar un estado
 */
export const estadoValidation = Joi.object({
  Descripcion: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      "string.empty": "La descripción del estado no puede estar vacía.",
      "any.required": "La descripción del estado es obligatoria.",
      "string.base": "La descripción del estado debe ser de tipo texto.",
      "string.min": "La descripción del estado debe tener al menos 2 caracteres.",
      "string.max": "La descripción del estado debe tener como máximo 200 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar un estado
 */
export const updateEstadoValidation = Joi.object({
  Descripcion: Joi.string()
    .min(2)
    .max(200)
    .messages({
      "string.empty": "La descripción del estado no puede estar vacía.",
      "string.base": "La descripción del estado debe ser de tipo texto.",
      "string.min": "La descripción del estado debe tener al menos 2 caracteres.",
      "string.max": "La descripción del estado debe tener como máximo 200 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo para actualizar.",
  });
