"use strict";

/**
 * Middleware para limitar el tamaño del body de las peticiones
 */
export function bodyLimit(limit = '10mb') {
  return (req, res, next) => {
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length']);
      const limitBytes = parseSize(limit);

      if (contentLength > limitBytes) {
        return res.status(413).json({
          status: "Client error",
          message: "Payload too large",
          details: `El tamaño máximo permitido es ${limit}`,
        });
      }
    }
    next();
  };
}

/**
 * Helper para convertir string de tamaño a bytes
 */
function parseSize(size) {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
  if (!match) return parseInt(size);

  const value = parseFloat(match[1]);
  const unit = match[2];

  return value * (units[unit] || 1);
}

/**
 * Middleware para rate limiting simple (contador en memoria)
 */
const requestCounts = new Map();

export function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    max = 100, // máximo de requests
    message = "Demasiadas solicitudes, intente más tarde",
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const key = `${ip}`;

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = requestCounts.get(key);

    if (now > record.resetTime) {
      // Reset del contador
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        status: "Client error",
        message: message,
        details: `Límite de ${max} solicitudes por ${windowMs / 1000 / 60} minutos excedido`,
      });
    }

    record.count++;
    next();
  };
}

/**
 * Middleware para CORS personalizado
 */
export function customCors(options = {}) {
  const {
    origin = '*',
    methods = 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials = true,
    allowedHeaders = 'Content-Type,Authorization',
  } = options;

  return (req, res, next) => {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', methods);
    res.header('Access-Control-Allow-Headers', allowedHeaders);

    if (credentials) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  };
}

/**
 * Middleware para agregar headers de seguridad
 */
export function securityHeaders(req, res, next) {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevenir MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Habilitar XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  );

  next();
}
