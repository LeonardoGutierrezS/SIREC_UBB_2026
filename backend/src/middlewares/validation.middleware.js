"use strict";
import {
  handleErrorClient,
} from "../handlers/responseHandlers.js";

/**
 * Middleware para validar campos requeridos en el body
 */
export function validateRequiredFields(requiredFields) {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Campos requeridos faltantes",
        { camposFaltantes: missingFields },
      );
    }

    next();
  };
}

/**
 * Middleware para validar que el ID es un número
 */
export function validateNumericId(req, res, next) {
  const id = req.params.id;

  if (!id) {
    return handleErrorClient(
      res,
      400,
      "ID es requerido",
    );
  }

  if (isNaN(id)) {
    return handleErrorClient(
      res,
      400,
      "ID debe ser un número válido",
    );
  }

  next();
}

/**
 * Middleware para validar formato de RUT chileno
 */
export function validateRut(req, res, next) {
  const rut = req.body.Rut || req.query.rut;

  if (!rut) {
    return next();
  }

  // Formato básico de RUT: 12345678-9
  const rutRegex = /^[0-9]{7,8}-[0-9Kk]{1}$/;

  if (!rutRegex.test(rut)) {
    return handleErrorClient(
      res,
      400,
      "Formato de RUT inválido",
      "El RUT debe tener el formato: 12345678-9",
    );
  }

  next();
}

/**
 * Middleware para validar formato de email
 */
export function validateEmail(req, res, next) {
  const email = req.body.Correo || req.body.email;

  if (!email) {
    return next();
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return handleErrorClient(
      res,
      400,
      "Formato de email inválido",
    );
  }

  next();
}

/**
 * Middleware para validar fechas
 */
export function validateDate(dateField) {
  return (req, res, next) => {
    const dateValue = req.body[dateField];

    if (!dateValue) {
      return next();
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return handleErrorClient(
        res,
        400,
        `Formato de fecha inválido en ${dateField}`,
        "La fecha debe estar en formato ISO 8601",
      );
    }

    next();
  };
}

/**
 * Middleware para validar que fecha_termino es posterior a fecha_inicio
 */
export function validateDateRange(req, res, next) {
  const { fecha_inicio, fecha_termino } = req.body;

  if (!fecha_inicio || !fecha_termino) {
    return next();
  }

  const inicio = new Date(fecha_inicio);
  const termino = new Date(fecha_termino);

  if (termino <= inicio) {
    return handleErrorClient(
      res,
      400,
      "Rango de fechas inválido",
      "La fecha de término debe ser posterior a la fecha de inicio",
    );
  }

  next();
}

/**
 * Middleware para sanitizar entrada de texto
 */
export function sanitizeInput(req, res, next) {
  // Función para limpiar strings
  const cleanString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  };

  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = cleanString(req.body[key]);
      }
    });
  }

  // Sanitizar query params
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = cleanString(req.query[key]);
      }
    });
  }

  next();
}
