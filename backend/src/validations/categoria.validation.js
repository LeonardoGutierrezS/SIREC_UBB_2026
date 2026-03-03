"use strict";
import Joi from "joi";

/**
 * Validación para crear o actualizar una categoría
 */
export const categoriaValidation = Joi.object({
  Descripcion: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      "string.empty": "La descripción de la categoría no puede estar vacía.",
      "any.required": "La descripción de la categoría es obligatoria.",
      "string.base": "La descripción de la categoría debe ser de tipo texto.",
      "string.min": "La descripción de la categoría debe tener al menos 2 caracteres.",
      "string.max": "La descripción de la categoría debe tener como máximo 200 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar una categoría
 */
export const updateCategoriaValidation = Joi.object({
  Descripcion: Joi.string()
    .min(2)
    .max(200)
    .messages({
      "string.empty": "La descripción de la categoría no puede estar vacía.",
      "string.base": "La descripción de la categoría debe ser de tipo texto.",
      "string.min": "La descripción de la categoría debe tener al menos 2 caracteres.",
      "string.max": "La descripción de la categoría debe tener como máximo 200 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo para actualizar.",
  });
