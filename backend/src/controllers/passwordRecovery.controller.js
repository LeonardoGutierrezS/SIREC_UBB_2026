"use strict";
import {
  requestPasswordResetService,
  resetPasswordService,
  verifyResetTokenService,
} from "../services/passwordRecovery.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Solicitar recuperación de contraseña
 */
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return handleErrorClient(res, 400, "El correo electrónico es requerido");
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return handleErrorClient(res, 400, "Formato de correo inválido");
    }

    const [result, error] = await requestPasswordResetService(email);

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    handleSuccess(
      res,
      200,
      "Se ha enviado un correo con instrucciones para recuperar tu contraseña"
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Verificar token de recuperación
 */
export async function verifyResetToken(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return handleErrorClient(res, 400, "Token requerido");
    }

    const [result, error] = await verifyResetTokenService(token);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    handleSuccess(res, 200, "Token válido", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Resetear contraseña con token
 */
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Validaciones
    if (!token) {
      return handleErrorClient(res, 400, "Token requerido");
    }

    if (!newPassword || !confirmPassword) {
      return handleErrorClient(res, 400, "Ambas contraseñas son requeridas");
    }

    if (newPassword !== confirmPassword) {
      return handleErrorClient(res, 400, "Las contraseñas no coinciden");
    }

    // Validar longitud
    if (newPassword.length < 8) {
      return handleErrorClient(
        res,
        400,
        "La contraseña debe tener al menos 8 caracteres"
      );
    }

    if (newPassword.length > 26) {
      return handleErrorClient(
        res,
        400,
        "La contraseña debe tener máximo 26 caracteres"
      );
    }

    // Validar composición básica de la contraseña
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase) {
      return handleErrorClient(
        res,
        400,
        "La contraseña debe contener letras mayúsculas y minúsculas"
      );
    }

    if (!hasNumber) {
      return handleErrorClient(
        res,
        400,
        "La contraseña debe contener al menos un número"
      );
    }

    // Validar que no contenga caracteres inválidos si es necesario
    if (!/^[a-zA-Z0-9\W_]*$/.test(newPassword)) {
      return handleErrorClient(
        res,
        400,
        "La contraseña contiene caracteres no válidos"
      );
    }

    const [result, error] = await resetPasswordService(token, newPassword);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    handleSuccess(res, 200, "Contraseña actualizada correctamente", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
