"use strict";
import Joi from "joi";

/**
 * Validación para asignar una carrera a un estudiante
 */
export const poseeCarreraValidation = Joi.object({
  Rut_profesor: Joi.string()
    .pattern(/^[0-9]{7,8}-[0-9Kk]$/)
    .required()
    .messages({
      "string.empty": "El RUT no puede estar vacío.",
      "any.required": "El RUT es obligatorio.",
      "string.base": "El RUT debe ser de tipo texto.",
      "string.pattern.base": "El RUT debe tener el formato 12345678-9.",
    }),
  ID_Carrera: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de carrera debe ser un número.",
      "number.integer": "El ID de carrera debe ser un número entero.",
      "number.positive": "El ID de carrera debe ser un número positivo.",
      "any.required": "El ID de carrera es obligatorio.",
    }),
  Anio_Ingreso: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .allow(null)
    .messages({
      "number.base": "El año de ingreso debe ser un número.",
      "number.integer": "El año de ingreso debe ser un número entero.",
      "number.min": "El año de ingreso debe ser mayor a 1900.",
      "number.max": `El año de ingreso no puede ser mayor a ${new Date().getFullYear() + 1}.`,
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para actualizar el año de ingreso
 */
export const updateAnioIngresoValidation = Joi.object({
  Anio_Ingreso: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      "number.base": "El año de ingreso debe ser un número.",
      "number.integer": "El año de ingreso debe ser un número entero.",
      "number.min": "El año de ingreso debe ser mayor a 1900.",
      "number.max": `El año de ingreso no puede ser mayor a ${new Date().getFullYear() + 1}.`,
      "any.required": "El año de ingreso es obligatorio.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
