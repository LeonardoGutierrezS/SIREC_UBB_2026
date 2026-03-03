"use strict";

/**
 * Middleware para logging de requests
 */
export function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log del body en métodos POST, PUT, PATCH (excepto passwords)
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '***';
    if (logBody.Contrasenia) logBody.Contrasenia = '***';
    if (logBody.newPassword) logBody.newPassword = '***';
    console.log(`  Body:`, logBody);
  }

  // Capturar el tiempo de respuesta
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${timestamp}] ${method} ${url} - Status: ${res.statusCode} - ${duration}ms`);
  });

  next();
}

/**
 * Middleware para logging de errores
 */
export function errorLogger(err, req, res, next) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR:`, {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  next(err);
}
