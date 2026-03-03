"use strict";
import Joi from "joi";

/**
 * Validación para crear o actualizar una marca
 */
export const marcaValidation = Joi.object({
  Descripcion: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "El nombre de la marca no puede estar vacío.",
      "any.required": "El nombre de la marca es obligatorio.",
      "string.base": "El nombre de la marca debe ser de tipo texto.",
      "string.min": "El nombre de la marca debe tener al menos 2 caracteres.",
      "string.max": "El nombre de la marca debe tener como máximo 100 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar una marca
 */
export const updateMarcaValidation = Joi.object({
  Descripcion: Joi.string()
    .min(2)
    .max(100)
    .messages({
      "string.empty": "El nombre de la marca no puede estar vacío.",
      "string.base": "El nombre de la marca debe ser de tipo texto.",
      "string.min": "El nombre de la marca debe tener al menos 2 caracteres.",
      "string.max": "El nombre de la marca debe tener como máximo 100 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo para actualizar.",
  });
