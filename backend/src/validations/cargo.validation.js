"use strict";
import Joi from "joi";

/**
 * Validación para crear cargo
 */
export const cargoValidation = Joi.object({
  Rut: Joi.string()
    .pattern(/^[0-9]{7,8}-[0-9Kk]$/)
    .required()
    .messages({
      "string.empty": "El RUT no puede estar vacío.",
      "any.required": "El RUT es obligatorio.",
      "string.base": "El RUT debe ser de tipo texto.",
      "string.pattern.base": "El RUT debe tener el formato 12345678-9.",
    }),
  Desc_Cargo: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "La descripción del cargo no puede estar vacía.",
      "any.required": "La descripción del cargo es obligatoria.",
      "string.base": "La descripción del cargo debe ser de tipo texto.",
      "string.min": "La descripción del cargo debe tener al menos 3 caracteres.",
      "string.max": "La descripción del cargo debe tener como máximo 100 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar cargo
 */
export const updateCargoValidation = Joi.object({
  Desc_Cargo: Joi.string()
    .min(3)
    .max(100)
    .messages({
      "string.empty": "La descripción del cargo no puede estar vacía.",
      "string.base": "La descripción del cargo debe ser de tipo texto.",
      "string.min": "La descripción del cargo debe tener al menos 3 caracteres.",
      "string.max": "La descripción del cargo debe tener como máximo 100 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
