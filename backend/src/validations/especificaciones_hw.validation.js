"use strict";
import Joi from "joi";

/**
 * Validación para crear especificación de hardware
 */
export const especificacionHWValidation = Joi.object({
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
  Tipo_Especificacion_HW: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "El tipo de especificación no puede estar vacío.",
      "any.required": "El tipo de especificación es obligatorio.",
      "string.base": "El tipo de especificación debe ser de tipo texto.",
      "string.min": "El tipo de especificación debe tener al menos 3 caracteres.",
      "string.max": "El tipo de especificación debe tener como máximo 100 caracteres.",
    }),
  Descripcion: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.base": "La descripción debe ser de tipo texto.",
      "string.max": "La descripción debe tener como máximo 500 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar especificación de hardware
 */
export const updateEspecificacionHWValidation = Joi.object({
  Tipo_Especificacion_HW: Joi.string()
    .min(3)
    .max(100)
    .messages({
      "string.empty": "El tipo de especificación no puede estar vacío.",
      "string.base": "El tipo de especificación debe ser de tipo texto.",
      "string.min": "El tipo de especificación debe tener al menos 3 caracteres.",
      "string.max": "El tipo de especificación debe tener como máximo 100 caracteres.",
    }),
  Descripcion: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.base": "La descripción debe ser de tipo texto.",
      "string.max": "La descripción debe tener como máximo 500 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
