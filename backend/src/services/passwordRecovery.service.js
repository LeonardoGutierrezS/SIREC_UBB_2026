"use strict";
import User from "../entity/user.entity.js";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET, FRONTEND_URL } from "../config/configEnv.js";
import { sendEmail } from "./email.service.js";

/**
 * Genera un token de recuperación de contraseña y envía el correo
 */
export async function requestPasswordResetService(email) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Buscar el usuario por correo
    const userFound = await userRepository.findOne({
      where: { Correo: email },
    });

    if (!userFound) {
      return [null, "No existe una cuenta registrada con este correo electrónico"];
    }

    // Generar token de recuperación válido por 1 hora
    const resetToken = jwt.sign(
      { 
        rut: userFound.Rut, 
        email: userFound.Correo,
        type: 'password-reset'
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // URL del frontend para resetear contraseña
    const resetUrl = `${FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // HTML del correo con diseño mejorado
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #003b5c; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #003b5c; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SIREC - Sistema de Registro de Equipos Computacionales</h1>
          </div>
          
          <div class="content">
            <h2>Recuperación de Contraseña</h2>
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en SIREC UBB.</p>
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <center>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </center>
            
            <p>O copia y pega el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace es válido por <strong>1 hora</strong></li>
                <li>Si no solicitaste este cambio, ignora este correo</li>
                <li>Tu contraseña actual seguirá siendo válida hasta que establezcas una nueva</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Universidad del Bío-Bío - Facultad de Ciencias Empresariales</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Recuperación de Contraseña - SIREC UBB

Hemos recibido una solicitud para restablecer tu contraseña.

Para crear una nueva contraseña, visita el siguiente enlace:
${resetUrl}

Este enlace es válido por 1 hora.

Si no solicitaste este cambio, ignora este correo.

Universidad del Bío-Bío
    `;

    // Enviar correo
    await sendEmail(
      email,
      "Recuperación de Contraseña - SIREC UBB",
      textContent,
      htmlContent
    );

    return [true, null];
  } catch (error) {
    console.error("Error en solicitud de recuperación:", error);
    return [null, "Error al procesar la solicitud de recuperación"];
  }
}

/**
 * Verifica el token y resetea la contraseña
 */
export async function resetPasswordService(token, newPassword) {
  try {
    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return [null, "El enlace de recuperación ha expirado. Solicita uno nuevo."];
      }
      return [null, "El enlace de recuperación no es válido"];
    }

    // Validar que sea un token de recuperación
    if (decoded.type !== 'password-reset') {
      return [null, "Token inválido"];
    }

    const userRepository = AppDataSource.getRepository(User);

    // Buscar el usuario
    const userFound = await userRepository.findOne({
      where: { Rut: decoded.rut },
    });

    if (!userFound) {
      return [null, "Usuario no encontrado"];
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await encryptPassword(newPassword);

    // Actualizar la contraseña
    userFound.Contrasenia = hashedPassword;
    await userRepository.save(userFound);

    // Enviar correo de confirmación
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .alert { background-color: #d1ecf1; padding: 15px; border-left: 4px solid #0c5460; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Contraseña Actualizada</h1>
          </div>
          
          <div class="content">
            <h2>Tu contraseña ha sido modificada exitosamente</h2>
            <p>Hola <strong>${userFound.Nombre_Completo}</strong>,</p>
            <p>Te confirmamos que la contraseña de tu cuenta en SIREC UBB ha sido actualizada correctamente.</p>
            <p>Ahora puedes iniciar sesión con tu nueva contraseña.</p>
            
            <div class="alert">
              <strong>🔒 Medida de Seguridad</strong>
              <p>Si tú no realizaste este cambio, contacta inmediatamente al administrador del sistema.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Universidad del Bío-Bío - Facultad de Ciencias Empresariales</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const confirmationText = `
Contraseña Actualizada - SIREC UBB

Hola ${userFound.Nombre_Completo},

Tu contraseña ha sido modificada exitosamente.
Ahora puedes iniciar sesión con tu nueva contraseña.

Si tú no realizaste este cambio, contacta inmediatamente al administrador.

Universidad del Bío-Bío
    `;

    await sendEmail(
      userFound.Correo,
      "Contraseña Actualizada - SIREC UBB",
      confirmationText,
      confirmationHtml
    );

    return [{ message: "Contraseña actualizada correctamente" }, null];
  } catch (error) {
    console.error("Error al resetear contraseña:", error);
    return [null, "Error al actualizar la contraseña"];
  }
}

/**
 * Verifica si un token de recuperación es válido
 */
export async function verifyResetTokenService(token) {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    
    if (decoded.type !== 'password-reset') {
      return [null, "Token inválido"];
    }

    return [{ valid: true, email: decoded.email }, null];
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return [null, "El enlace ha expirado"];
    }
    return [null, "Token inválido"];
  }
}
