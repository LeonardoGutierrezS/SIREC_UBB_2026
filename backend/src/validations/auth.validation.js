"use strict";
import Joi from "joi";

export const authValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "El correo electrónico debe ser un email válido.",
    }),
  password: Joi.string()
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const registerValidation = Joi.object({
  nombreCompleto: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre completo no puede estar vacío.",
      "any.required": "El nombre completo es obligatorio.",
      "string.base": "El nombre completo debe ser de tipo texto.",
      "string.min": "El nombre completo debe tener al menos 15 caracteres.",
      "string.max": "El nombre completo debe tener como máximo 50 caracteres.",
      "string.pattern.base": "El nombre completo solo puede contener letras y espacios.",
    }),
  rut: Joi.string()
    .min(9)
    .max(12)
    .required()
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
    .custom((value, helpers) => {
      const clean = value.replace(/\./g, "").replace("-", "").toUpperCase();
      const body = clean.slice(0, -1);
      const dv = clean.slice(-1);
      
      let sum = 0;
      let multiplier = 2;
      for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
      }
      
      const expectedDv = 11 - (sum % 11);
      let dvChar = expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : expectedDv.toString();
      
      if (dvChar !== dv) {
        return helpers.message("El RUT ingresado no es válido (dígito verificador incorrecto).");
      }
      return value;
    })
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 12 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "El correo electrónico debe ser un email válido.",
    }),
  password: Joi.string()
    .min(8)
    .max(26)
    // Se elimina el patrón estricto para permitir caracteres especiales si se desea, 
    // o se ajusta. Por ahora permitimos cualquier caracter siempre que cumpla longitud.
    // O mejor, un patrón que permita simbolos:
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]+$/)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatorio.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base": "La contraseña debe tener al menos una mayúscula, una minúscula y un número.",
    }),
  tipoUsuario: Joi.string()
    .valid('Alumno', 'Profesor')
    .required()
    .messages({
      "string.empty": "El tipo de usuario no puede estar vacío.",
      "any.required": "El tipo de usuario es obligatorio.",
      "any.only": "El tipo de usuario debe ser Alumno o Profesor.",
    }),
  carreraId: Joi.number()
    .integer()
    .positive()
    .when('tipoUsuario', {
      is: 'Alumno',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      "number.base": "La carrera debe ser un número.",
      "number.integer": "La carrera debe ser un número entero.",
      "number.positive": "La carrera debe ser un número positivo.",
      "any.required": "La carrera es obligatoria para alumnos.",
      "any.unknown": "La carrera no es válida para profesores.",
    }),
  cargo: Joi.string()
    .min(3)
    .max(100)
    .when('tipoUsuario', {
      is: 'Profesor',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      "string.empty": "El cargo no puede estar vacío.",
      "any.required": "El cargo es obligatorio para profesores.",
      "string.base": "El cargo debe ser de tipo texto.",
      "string.min": "El cargo debe tener al menos 3 caracteres.",
      "string.max": "El cargo debe tener como máximo 100 caracteres.",
      "any.unknown": "El cargo no es válido para alumnos.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });