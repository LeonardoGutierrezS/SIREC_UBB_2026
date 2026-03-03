"use strict";
import Joi from "joi";

/**
 * Validación para aprobar solicitud
 */
export const aprobarSolicitudValidation = Joi.object({
  ID_Solicitud: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de solicitud debe ser un número.",
      "number.integer": "El ID de solicitud debe ser un número entero.",
      "number.positive": "El ID de solicitud debe ser un número positivo.",
      "any.required": "El ID de solicitud es obligatorio.",
    }),
  Rut_Autorizador: Joi.string()
    .pattern(/^[0-9]{7,8}-[0-9Kk]$/)
    .required()
    .messages({
      "string.empty": "El RUT del autorizador no puede estar vacío.",
      "any.required": "El RUT del autorizador es obligatorio.",
      "string.base": "El RUT del autorizador debe ser de tipo texto.",
      "string.pattern.base": "El RUT debe tener el formato 12345678-9.",
    }),
  ID_Num_Inv: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "El número de inventario no puede estar vacío.",
      "any.required": "El número de inventario es obligatorio.",
      "string.base": "El número de inventario debe ser de tipo texto.",
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
      "string.max": "Las condiciones deben tener como máximo 500 caracteres.",
    }),
  Fecha_Aut: Joi.date()
    .messages({
      "date.base": "La fecha de autorización debe ser una fecha válida.",
    }),
  Hora_Aut: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.empty": "La hora de autorización no puede estar vacía.",
      "any.required": "La hora de autorización es obligatoria.",
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Obs_Aut: Joi.string()
    .max(500)
    .allow(null, "")
    .messages({
      "string.max": "Las observaciones deben tener como máximo 500 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/**
 * Validación para rechazar solicitud
 */
export const rechazarSolicitudValidation = Joi.object({
  ID_Solicitud: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de solicitud debe ser un número.",
      "number.integer": "El ID de solicitud debe ser un número entero.",
      "number.positive": "El ID de solicitud debe ser un número positivo.",
      "any.required": "El ID de solicitud es obligatorio.",
    }),
  Rut_Autorizador: Joi.string()
    .pattern(/^[0-9]{7,8}-[0-9Kk]$/)
    .required()
    .messages({
      "string.empty": "El RUT del autorizador no puede estar vacío.",
      "any.required": "El RUT del autorizador es obligatorio.",
      "string.pattern.base": "El RUT debe tener el formato 12345678-9.",
    }),
  ID_Num_Inv: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "El número de inventario no puede estar vacío.",
      "any.required": "El número de inventario es obligatorio.",
    }),
  Fecha_Aut: Joi.date()
    .messages({
      "date.base": "La fecha de autorización debe ser una fecha válida.",
    }),
  Hora_Aut: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.empty": "La hora de autorización no puede estar vacía.",
      "any.required": "La hora de autorización es obligatoria.",
      "string.pattern.base": "La hora debe tener el formato HH:MM o HH:MM:SS.",
    }),
  Motivo_Rechazo: Joi.string()
    .max(500)
    .required()
    .messages({
      "string.empty": "El motivo de rechazo no puede estar vacío.",
      "any.required": "El motivo de rechazo es obligatorio.",
      "string.max": "El motivo de rechazo debe tener como máximo 500 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
