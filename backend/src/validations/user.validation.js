import Joi from "joi";
import { validateRutHelper } from "../helpers/rut.helper.js";

export const userQueryValidation = Joi.object({
  email: Joi.string()
    .min(5)
    .max(50)
    .email()
    .pattern(/\.(cl|com)$/)
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
      "string.pattern.base": "El correo electrónico debe terminar en .cl o .com",
      "string.min": "El correo electrónico debe tener como mínimo 5 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 50 caracteres.",
    }),
  rut: Joi.string()
    .min(9)
    .max(12)
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
    .custom((value, helpers) => {
      if (!validateRutHelper(value)) {
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
})
  .or("email", "rut")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un parámetro: id, email o rut.",
  });

export const userBodyValidation = Joi.object({
  nombreCompleto: Joi.string()
    .min(15)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      "string.empty": "El nombre completo no puede estar vacío.",
      "string.base": "El nombre completo debe ser de tipo string.",
      "string.min": "El nombre completo debe tener como mínimo 15 caracteres.",
      "string.max": "El nombre completo debe tener como máximo 50 caracteres.",
      "string.pattern.base":
        "El nombre completo solo puede contener letras y espacios.",
    }),
  email: Joi.string()
    .min(5)
    .max(50)
    .email()
    .pattern(/\.(cl|com)$/)
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
      "string.pattern.base": "El correo electrónico debe terminar en .cl o .com",
      "string.min": "El correo electrónico debe tener como mínimo 5 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 50 caracteres.",
    }),
  password: Joi.string()
    .min(8)
    .max(26)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "string.base": "La contraseña debe ser de tipo string.",
      "string.min": "La contraseña debe tener como mínimo 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base":
        "La contraseña debe tener al menos una mayúscula, una minúscula y un número.",
    }),
  newPassword: Joi.string()
    .min(8)
    .max(26)
    .allow("")
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      "string.empty": "La nueva contraseña no puede estar vacía.",
      "string.base": "La nueva contraseña debe ser de tipo string.",
      "string.min": "La nueva contraseña debe tener como mínimo 8 caracteres.",
      "string.max": "La nueva contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base":
        "La nueva contraseña debe tener al menos una mayúscula, una minúscula y un número.",
    }),
  rut: Joi.string()
    .min(9)
    .max(12)
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
    .custom((value, helpers) => {
      if (!validateRutHelper(value)) {
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
  rol: Joi.string()
    .min(4)
    .max(15)
    .messages({
      "string.base": "El rol debe ser de tipo string.",
      "string.min": "El rol debe tener como mínimo 4 caracteres.",
      "string.max": "El rol debe tener como máximo 15 caracteres.",
    }),
  codTipoUsuario: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El código de tipo de usuario debe ser un número.",
      "number.integer": "El código de tipo de usuario debe ser un número entero.",
      "number.positive": "El código de tipo de usuario debe ser un número positivo.",
    }),
  idCargo: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      "number.base": "El ID del cargo debe ser un número.",
      "number.integer": "El ID del cargo debe ser un número entero.",
      "number.positive": "El ID del cargo debe ser un número positivo.",
    }),
  idCarrera: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      "number.base": "El ID de la carrera debe ser un número.",
      "number.integer": "El ID de la carrera debe ser un número entero.",
      "number.positive": "El ID de la carrera debe ser un número positivo.",
    }),
  descripcionCargo: Joi.string()
    .max(255)
    .allow(null, "")
    .messages({
      "string.base": "La descripción del cargo debe ser de tipo string.",
      "string.max": "La descripción del cargo no puede exceder los 255 caracteres.",
    }),
  vigente: Joi.boolean()
    .messages({
      "boolean.base": "El campo vigente debe ser un valor booleano.",
    }),
})
  .or(
    "nombreCompleto",
    "email",
    "password",
    "newPassword",
    "rut",
    "rol",
    "codTipoUsuario",
    "idCargo",
    "idCarrera",
    "vigente"
  )
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo para actualizar.",
  });
