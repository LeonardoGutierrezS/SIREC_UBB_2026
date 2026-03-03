"use strict";
import Joi from "joi";

/**
 * Validación para crear tipo de usuario
 */
export const tipoUsuarioValidation = Joi.object({
  Descripcion: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "La descripción no puede estar vacía.",
      "any.required": "La descripción es obligatoria.",
      "string.base": "La descripción debe ser de tipo texto.",
      "string.min": "La descripción debe tener al menos 3 caracteres.",
      "string.max": "La descripción debe tener como máximo 50 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar tipo de usuario
 */
export const updateTipoUsuarioValidation = Joi.object({
  Descripcion: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.empty": "La descripción no puede estar vacía.",
      "string.base": "La descripción debe ser de tipo texto.",
      "string.min": "La descripción debe tener al menos 3 caracteres.",
      "string.max": "La descripción debe tener como máximo 50 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
