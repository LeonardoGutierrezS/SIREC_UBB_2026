"use strict";
import Joi from "joi";

/**
 * Validación para crear préstamo (simplificado)
 * Nota: Los préstamos ahora se crean a través del proceso de autorización
 */
export const prestamoValidation = Joi.object({
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
  Fecha_inicio_prestamo: Joi.date()
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida.",
    }),
  Hora_inicio_prestamo: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.empty": "La hora de inicio no puede estar vacía.",
      "any.required": "La hora de inicio es obligatoria.",
      "string.base": "La hora de inicio debe ser de tipo texto.",
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Fecha_fin_prestamo: Joi.date()
    .allow(null)
    .messages({
      "date.base": "La fecha de fin debe ser una fecha válida.",
    }),
  Hora_fin_prestamo: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .allow(null, "")
    .messages({
      "string.base": "La hora de fin debe ser de tipo texto.",
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Tipo_documento: Joi.string()
    .max(100)
    .allow(null, "")
    .messages({
      "string.base": "El tipo de documento debe ser de tipo texto.",
      "string.max": "El tipo de documento debe tener como máximo 100 caracteres.",
    }),
  Condiciones_Prestamo: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.base": "Las condiciones del préstamo deben ser de tipo texto.",
      "string.max": "Las condiciones del préstamo deben tener como máximo 500 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar préstamo
 */
export const updatePrestamoValidation = Joi.object({
  Fecha_fin_prestamo: Joi.date()
    .allow(null)
    .messages({
      "date.base": "La fecha de fin debe ser una fecha válida.",
    }),
  Hora_fin_prestamo: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .allow(null, "")
    .messages({
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Tipo_documento: Joi.string()
    .max(100)
    .allow(null, "")
    .messages({
      "string.max": "El tipo de documento debe tener como máximo 100 caracteres.",
    }),
  Condiciones_Prestamo: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.max": "Las condiciones del préstamo deben tener como máximo 500 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para finalizar préstamo (registrar devolución)
 */
export const finalizarPrestamoValidation = Joi.object({
  Fecha_devolucion: Joi.date()
    .messages({
      "date.base": "La fecha de devolución debe ser una fecha válida.",
    }),
  Hora_devolucion: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .messages({
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Observaciones: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.max": "Las observaciones deben tener como máximo 500 caracteres.",
    }),
  ID_Estado_Prestamo: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID del estado debe ser un número.",
      "number.integer": "El ID del estado debe ser un número entero.",
      "number.positive": "El ID del estado debe ser positivo.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
