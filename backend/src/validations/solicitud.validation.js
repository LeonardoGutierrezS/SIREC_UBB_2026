"use strict";
import Joi from "joi";

/**
 * Validación para crear solicitud
 */
export const solicitudValidation = Joi.object({
  Rut: Joi.string()
    .pattern(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9Kk]$/)
    .required()
    .messages({
      "string.empty": "El RUT no puede estar vacío.",
      "any.required": "El RUT es obligatorio.",
      "string.base": "El RUT debe ser de tipo texto.",
      "string.pattern.base": "El RUT debe tener el formato 12345678-9 o 12.345.678-9.",
    }),
  ID_Num_Inv: Joi.string()
    .max(50)
    .required()
    .messages({
      "string.empty": "El número de inventario no puede estar vacío.",
      "any.required": "El número de inventario es obligatorio.",
      "string.base": "El número de inventario debe ser de tipo texto.",
      "string.max": "El número de inventario debe tener como máximo 50 caracteres.",
    }),
  Fecha_Sol: Joi.date()
    .messages({
      "date.base": "La fecha de solicitud debe ser una fecha válida.",
    }),
  Hora_Sol: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.empty": "La hora de solicitud no puede estar vacía.",
      "any.required": "La hora de solicitud es obligatoria.",
      "string.base": "La hora de solicitud debe ser de tipo texto.",
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Motivo_Sol: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.base": "El motivo de solicitud debe ser de tipo texto.",
      "string.max": "El motivo de solicitud debe tener como máximo 500 caracteres.",
    }),
  Fecha_inicio_sol: Joi.date()
    .allow(null)
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida.",
    }),
  Fecha_termino_sol: Joi.date()
    .allow(null)
    .messages({
      "date.base": "La fecha de término debe ser una fecha válida.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
