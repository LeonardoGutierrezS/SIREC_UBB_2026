import nodemailer from "nodemailer";
import { emailConfig, FRONTEND_URL, SUPPORT_EMAIL } from "../config/configEnv.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const transporter = nodemailer.createTransport({
    service: emailConfig.service,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
    },
});

// Helper interno para reintentos
const sendEmailWrapper = async (mailOptions, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await transporter.sendMail(mailOptions);
            return mailOptions;
        } catch (error) {
            console.error(`Error enviando correo a ${mailOptions.to} (intento ${i + 1}/${retries}): ${error.message}`);
            if (i === retries - 1) {
                console.error("Todos los intentos de envío fallaron.");
                throw error; // Re-lanzar el error final para que el llamador lo maneje
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

export const sendEmail = async (to, subject, text, html, attachments = []) => {
    const mailOptions = {
        from: `"Sistema de Reserva de Equipos Computacionales FACE UBB" <${emailConfig.user}>`,
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments,
    };
    return await sendEmailWrapper(mailOptions);
};

/**
 * =======================================================================
 * HELPERS DE DISEÑO Y NOTIFICACIONES
 * =======================================================================
 */

/**
 * Genera el HTML unificado para los correos del sistema
 */
function getUnifiedEmailTemplate({ title, greeting, intro, details, actions, color = "#003b7a", logoCid = "sirec-logo-blanco" }) {
  const frontendUrl = FRONTEND_URL || "http://localhost:5173";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${color} 0%, #002855 100%); padding: 30px 20px; text-align: center; color: white; }
        .logo-container { margin-bottom: 15px; }
        .logo-container img { max-height: 80px; width: auto; }
        .header-title { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 35px 25px; background-color: #ffffff; }
        .details-box { background-color: #f8f9fa; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .detail-item { margin: 8px 0; font-size: 14px; }
        .detail-label { font-weight: bold; color: #555; }
        .action-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; padding: 12px 30px; background-color: ${color}; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; }
        .footer { background-color: #003b7a; color: white; text-align: center; padding: 25px 20px; font-size: 12px; }
        .footer-logo { margin-top: 15px; }
        .footer-logo img { max-height: 45px; width: auto; }
        .specs-list { margin-top: 10px; padding-left: 20px; font-size: 13px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="cid:${logoCid}" alt="SIREC" />
          </div>
          <h1 class="header-title">${title}</h1>
        </div>
        <div class="content">
          <p>Estimado/a <strong>${greeting}</strong>,</p>
          <p>${intro}</p>
          
          <div class="details-box">
            ${details}
          </div>
          
          ${actions ? `<div class="action-container">${actions}</div>` : ""}
          
          <p style="font-size: 13px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            Este es un correo automático generado por SIREC, por favor no respondas a este mensaje. Si tienes dudas o necesitas asistencia técnica, estamos para ayudarte en: <a href="mailto:${SUPPORT_EMAIL}" style="color: #003b7a; text-decoration: underline;">${SUPPORT_EMAIL}</a>
          </p>
        </div>
        <div class="footer">
          <p><strong>Sistema de Reserva de Equipos Computacionales (SIREC)</strong><br>
          Facultad de Ciencias Empresariales<br>
          Universidad del Bío-Bío</p>
          <div class="footer-logo">
            <img src="cid:face-logo" alt="FACE UBB" />
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Formatea la información del equipo para el correo
 */
function formatEquipoDetails(equipo) {
  if (!equipo) return "<p>Información de equipo no disponible</p>";
  
  let specsHtml = "";
  if (equipo.especificaciones && equipo.especificaciones.length > 0) {
    specsHtml = '<div style="margin-top: 10px; padding: 10px; background-color: #f0f7ff; border-radius: 4px;">';
    specsHtml += '<p style="margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #003b7a;">Especificaciones Técnicas:</p>';
    specsHtml += '<ul class="specs-list" style="margin: 0; padding-left: 20px;">';
    equipo.especificaciones.forEach(spec => {
      specsHtml += `<li><strong>${spec.Tipo_Especificacion_HW}:</strong> ${spec.Descripcion}</li>`;
    });
    specsHtml += '</ul></div>';
  }

  return `
    <div class="detail-item"><span class="detail-label">N° de Inventario:</span> ${equipo.ID_Num_Inv}</div>
    <div class="detail-item"><span class="detail-label">Categoría:</span> ${equipo.categoria?.Descripcion || "No especificada"}</div>
    <div class="detail-item"><span class="detail-label">Marca:</span> ${equipo.marca?.Descripcion || "No especificada"}</div>
    <div class="detail-item"><span class="detail-label">Modelo:</span> ${equipo.Modelo}</div>
    ${specsHtml}
  `;
}

/**
 * Adjuntos comunes (logos)
 */
const getCommonAttachments = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // Nota: Buscamos los logos en la carpeta public del backend (un nivel arriba de src)
  const logoPath = path.join(__dirname, '../../public/images');
  
  return [
    {
      filename: 'sirec-logo-blanco.png',
      path: path.join(logoPath, 'sirec-logo-blanco.png'),
      cid: 'sirec-logo-blanco'
    },
    {
      filename: 'face-logo.png',
      path: path.join(logoPath, 'face-logo.png'),
      cid: 'face-logo'
    }
  ];
};

/**
 * =======================================================================
 * NOTIFICACIONES DE SOLICITUDES DE PRÉSTAMO
 * =======================================================================
 */

/**
 * Enviar correo de solicitud creada
 */
export async function enviarEmailSolicitudCreada(solicitud) {
  try {
    const attachments = await getCommonAttachments();
    const equipmentInfo = formatEquipoDetails(solicitud.equipo);
    
    const tipoSolicitud = solicitud.Fecha_inicio_sol && solicitud.Fecha_termino_sol ? "Largo Plazo" : "Diaria";
    const fechasText = tipoSolicitud === "Largo Plazo" 
      ? `del ${new Date(solicitud.Fecha_inicio_sol).toLocaleDateString('es-CL')} al ${new Date(solicitud.Fecha_termino_sol).toLocaleDateString('es-CL')}`
      : `para el día ${new Date(solicitud.Fecha_Sol).toLocaleDateString('es-CL')}`;

    const html = getUnifiedEmailTemplate({
      title: "Solicitud Recibida",
      greeting: `${solicitud.usuario.Nombre_Completo}`,
      intro: `Tu solicitud de préstamo ha sido registrada exitosamente. A continuación, los detalles del equipo solicitado:`,
      details: `
        <h3 style="color: #003b7a; margin-top: 0;">Información del Equipo</h3>
        ${equipmentInfo}
        <h3 style="color: #003b7a; margin-bottom: 5px;">Detalles de la Solicitud</h3>
        <div class="detail-item"><span class="detail-label">ID Solicitud:</span> ${solicitud.ID_Solicitud}</div>
        <div class="detail-item"><span class="detail-label">Tipo:</span> ${tipoSolicitud}</div>
        <div class="detail-item"><span class="detail-label">Período:</span> ${fechasText}</div>
        <div class="detail-item"><span class="detail-label">Motivo:</span> ${solicitud.Motivo_Sol || 'No especificado'}</div>
      `,
      actions: `<p>Recibirás una notificación cuando tu solicitud sea procesada.</p>`,
      color: "#003b7a"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: solicitud.usuario.Correo,
      subject: "✅ Solicitud de Préstamo Recibida - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de solicitud creada enviado a: ${solicitud.usuario.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de solicitud creada:", error);
  }
}

/**
 * Enviar correo a los Directores de Escuela sobre una nueva solicitud de largo plazo
 */
export async function enviarEmailDirectorNuevaSolicitud(director, solicitud) {
  try {
    const attachments = await getCommonAttachments();
    const equipmentInfo = formatEquipoDetails(solicitud.equipo);
    
    const fechainicio = new Date(solicitud.Fecha_inicio_sol).toLocaleDateString('es-CL');
    const fechatermino = new Date(solicitud.Fecha_termino_sol).toLocaleDateString('es-CL');

    const html = getUnifiedEmailTemplate({
      title: "Nueva Solicitud Pendiente de Revisión",
      greeting: `${director.Nombre_Completo}`,
      intro: `Se ha registrado una nueva solicitud de préstamo de **Largo Plazo** que requiere su revisión y aprobación.`,
      details: `
        <h3 style="color: #003b7a; margin-top: 0;">Información del Solicitante</h3>
        <div class="detail-item"><span class="detail-label">Nombre:</span> ${solicitud.usuario.Nombre_Completo}</div>
        <div class="detail-item"><span class="detail-label">Tipo:</span> ${solicitud.usuario.tipoUsuario.Descripcion}</div>
        <div class="detail-item"><span class="detail-label">Carrera/Cargo:</span> ${solicitud.usuario.carrera?.Nombre_Carrera || solicitud.usuario.cargo?.Desc_Cargo || 'No especificado'}</div>
        
        <h3 style="color: #003b7a;">Detalles del Préstamo</h3>
        <div class="detail-item"><span class="detail-label">Período:</span> del ${fechainicio} al ${fechatermino}</div>
        <div class="detail-item"><span class="detail-label">Motivo:</span> ${solicitud.Motivo_Sol || 'No especificado'}</div>
        
        <h3 style="color: #003b7a;">Equipo Solicitado</h3>
        ${equipmentInfo}
      `,
      actions: `
        <p>Por favor, acceda al sistema para gestionar esta solicitud:</p>
        <a href="${FRONTEND_URL || "http://localhost:5173"}/" class="button">Acceder al Sistema</a>
      `,
      color: "#003b7a"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: director.Correo,
      subject: "🔔 Nueva Solicitud de Largo Plazo Pendiente - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Notificación enviada al director: ${director.Correo}`);
  } catch (error) {
    console.error("Error al enviar email al director:", error);
  }
}

/**
 * Enviar correo a los Administradores sobre una nueva solicitud diaria
 */
export async function enviarEmailNotificacionAdminSolicitudDiaria(admin, solicitud) {
  try {
    const attachments = await getCommonAttachments();
    const equipmentInfo = formatEquipoDetails(solicitud.equipo);
    
    // Formatear fecha de solicitud
    let fechaSolText = "Hoy";
    if (solicitud.Fecha_Sol) {
        fechaSolText = new Date(solicitud.Fecha_Sol).toLocaleDateString('es-CL');
    }

    const html = getUnifiedEmailTemplate({
      title: "Nueva Solicitud Diaria",
      greeting: `${admin.Nombre_Completo}`,
      intro: `Se ha registrado una nueva solicitud de préstamo **Diaria** que requiere gestión.`,
      details: `
        <h3 style="color: #003b7a; margin-top: 0;">Información del Solicitante</h3>
        <div class="detail-item"><span class="detail-label">Nombre:</span> ${solicitud.usuario.Nombre_Completo}</div>
        <div class="detail-item"><span class="detail-label">Tipo:</span> ${solicitud.usuario.tipoUsuario.Descripcion}</div>
        <div class="detail-item"><span class="detail-label">Carrera/Cargo:</span> ${solicitud.usuario.carrera?.Nombre_Carrera || solicitud.usuario.cargo?.Desc_Cargo || 'No especificado'}</div>
        
        <h3 style="color: #003b7a;">Detalles del Préstamo</h3>
        <div class="detail-item"><span class="detail-label">Fecha:</span> ${fechaSolText}</div>
        <div class="detail-item"><span class="detail-label">Motivo:</span> ${solicitud.Motivo_Sol || 'No especificado'}</div>
        
        <h3 style="color: #003b7a;">Equipo Solicitado</h3>
        ${equipmentInfo}
      `,
      actions: `
        <p>Por favor, acceda al sistema para gestionar esta solicitud:</p>
        <a href="${FRONTEND_URL || "http://localhost:5173"}/" class="button">Acceder al Sistema</a>
      `,
      color: "#003b7a"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: admin.Correo,
      subject: "🔔 Nueva Solicitud Diaria Pendiente - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Notificación diaria enviada al admin: ${admin.Correo}`);
  } catch (error) {
    console.error("Error al enviar email al admin:", error);
  }
}

/**
 * Enviar correo de solicitud aprobada
 */
export async function enviarEmailSolicitudAprobada(solicitud, prestamo) {
  try {
    const attachments = await getCommonAttachments();
    const equipmentInfo = formatEquipoDetails(solicitud.equipo);

    const isLargoPlazo = solicitud.Fecha_inicio_sol && solicitud.Fecha_termino_sol && solicitud.Fecha_inicio_sol !== solicitud.Fecha_termino_sol;
    
    let instruccionesRetiro = "";
    if (isLargoPlazo) {
      instruccionesRetiro = `
        <div style="margin-top: 15px; padding: 15px; background-color: #e8f4fd; border-radius: 8px; border-left: 4px solid #2196F3;">
          <p style="margin: 0; color: #003b7a;"><strong>📍 Instrucciones de Retiro:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">
            Debes acercarte a cualquiera de las <strong>2 oficinas de los laboratorios de especialidades</strong>, ubicadas en el primer piso de la Facultad de Ciencias Empresariales.
          </p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            Allí deberás recoger un documento de autorización y recibir los pasos a seguir por parte de los encargados del laboratorio.
          </p>
        </div>`;
    } else {
      instruccionesRetiro = `
        <div style="margin-top: 15px; padding: 15px; background-color: #fff9db; border-radius: 8px; border-left: 4px solid #fcc419;">
          <p style="margin: 0; color: #856404;"><strong>📍 Instrucciones de Retiro:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">
            Debes acercarte a cualquiera de las <strong>2 oficinas de los laboratorios de especialidades</strong>, ubicadas en el primer piso de la Facultad de Ciencias Empresariales.
          </p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            <strong>Importante:</strong> Para retirar el equipo, debes dejar un documento de identidad (Cédula de Identidad o Pase Escolar) en garantía, el cual te será devuelto al retornar el equipo.
          </p>
        </div>`;
    }

    const html = getUnifiedEmailTemplate({
      title: "Solicitud Aprobada",
      greeting: `${solicitud.usuario.Nombre_Completo}`,
      intro: `¡Buenas noticias! Tu solicitud de préstamo ha sido <strong>aprobada</strong>.`,
      details: `
        <h3 style="color: #28a745; margin-top: 0;">Equipo Autorizado</h3>
        ${equipmentInfo}
        <h3 style="color: #28a745; margin-bottom: 5px;">Información del Préstamo</h3>
        <div class="detail-item"><span class="detail-label">ID Préstamo:</span> ${prestamo.ID_Prestamo}</div>
        <div class="detail-item"><span class="detail-label">Fecha Límite:</span> ${new Date(prestamo.Fecha_fin_prestamo).toLocaleDateString('es-CL')}</div>
        ${instruccionesRetiro}
      `,
      actions: `
        <p>El equipo ya está listo para ser gestionado. Por favor, sigue las instrucciones indicadas arriba.</p>
        <a href="${FRONTEND_URL || "http://localhost:5173"}/" class="button" style="background-color: #28a745;">Ir al Sistema</a>
      `,
      color: "#28a745"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: solicitud.usuario.Correo,
      subject: "✅ Solicitud Aprobada - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de solicitud aprobada enviado a: ${solicitud.usuario.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de solicitud aprobada:", error);
  }
}

/**
 * =======================================================================
 * NOTIFICACIONES DE GESTIÓN DE USUARIOS
 * =======================================================================
 */

/**
 * Enviar correo de usuario aprobado
 */
export async function enviarEmailUsuarioAprobado(user) {
  try {
    const attachments = await getCommonAttachments();
    const frontendUrl = FRONTEND_URL || "http://localhost:5173";

    const html = getUnifiedEmailTemplate({
      title: "Registro Aprobado",
      greeting: `${user.Nombre_Completo}`,
      intro: `Nos complace informarte que tu solicitud de registro en el **Sistema de Reserva de Equipos Computacionales (SIREC)** ha sido aprobada exitosamente.`,
      details: `
        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; color: #155724;">
            <strong>¡Tu cuenta está activa!</strong> Ya puedes acceder al sistema con las credenciales que registraste.
        </div>
      `,
      actions: `
        <p>Inicia sesión ahora para comenzar a usar nuestros servicios:</p>
        <a href="${frontendUrl}/" class="button" style="background-color: #28a745;">Iniciar Sesión</a>
      `,
      color: "#28a745" // Verde éxito
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: user.Correo,
      subject: "✅ Registro Aprobado - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de usuario aprobado enviado a: ${user.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de usuario aprobado:", error);
  }
}

/**
 * Enviar correo de usuario rechazado
 */
export async function enviarEmailUsuarioRechazado(user, motivo) {
  try {
    const attachments = await getCommonAttachments();

    const html = getUnifiedEmailTemplate({
      title: "Registro Rechazado",
      greeting: `${user.Nombre_Completo}`,
      intro: `Lamentamos informarte que tu solicitud de registro en el **Sistema de Reserva de Equipos Computacionales (SIREC)** ha sido rechazada.`,
      details: `
        <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; border-radius: 4px; color: #721c24;">
            <p style="margin: 0; font-weight: bold;">Motivo del rechazo:</p>
            <p style="margin: 5px 0 0 0;">${motivo}</p>
        </div>
            Si crees que esto es un error o deseas rectificar tu solicitud, por favor escríbenos a <a href="mailto:labespecialidades.face@ubiobio.cl">labespecialidades.face@ubiobio.cl</a>.
        </p>
      `,
      actions: ``,
      color: "#dc3545" // Rojo error
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: user.Correo,
      subject: "❌ Registro Rechazado - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de usuario rechazado enviado a: ${user.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de usuario rechazado:", error);
  }
}

/**
 * Enviar correo con credenciales provisionales (creación por admin)
 */
export async function enviarEmailCredencialesProvisorias(user) {
  try {
    const attachments = await getCommonAttachments();
    const frontendUrl = FRONTEND_URL || "http://localhost:5173";

    const html = getUnifiedEmailTemplate({
      title: "Bienvenido a SIREC",
      greeting: `${user.Nombre_Completo}`,
      intro: `Tu cuenta en el **Sistema de Reserva de Equipos Computacionales (SIREC)** ha sido creada exitosamente por un administrador.`,
      details: `
        <p>A continuación, encontrarás tus credenciales de acceso provisorias. Te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
        
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="margin-bottom: 15px;">
                <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px;">Correo Institucional</div>
                <div style="font-size: 18px; font-weight: bold; color: #333;">${user.Correo}</div>
            </div>
            
            <div>
                <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px;">Contraseña Provisoria</div>
                <div style="font-size: 24px; font-weight: bold; color: #003b7a; letter-spacing: 2px; background: white; padding: 10px; border-radius: 4px; display: inline-block; margin-top: 5px; border: 1px dashed #003b7a;">
                    ${user.provisionalPassword}
                </div>
            </div>
        </div>

        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; color: #856404; font-size: 14px;">
            <strong>⚠️ Importante - Seguridad:</strong>
            <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                <li>Esta contraseña es temporal.</li>
                <li>No la compartas con nadie.</li>
                <li>Si no solicitaste esta cuenta, contacta inmediatamente al administrador.</li>
            </ul>
        </div>
      `,
      actions: `
        <p>Accede al sistema para validar tu cuenta:</p>
        <a href="${frontendUrl}/" class="button" style="background-color: #28a745;">Iniciar Sesión</a>
      `,
      color: "#003b7a" // Azul Institucional
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: user.Correo,
      subject: "🔑 Credenciales de Acceso - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de credenciales provisionales enviado a: ${user.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de credenciales:", error);
  }
}

/**
 * Enviar correo de notificación a administradores cuando se aprueba una solicitud
 */
export async function enviarEmailNotificacionAdminAprobacion(admins, solicitud, prestamo) {
  try {
    const attachments = await getCommonAttachments();
    const emails = admins.map(admin => admin.Correo).join(', ');

    const html = getUnifiedEmailTemplate({
      title: "Notificación: Solicitud Aprobada",
      greeting: "Administrador",
      intro: `Se le informa que la siguiente solicitud de préstamo ha sido **aprobada** por la Dirección de Escuela y ya puede ser gestionada para su entrega.`,
      details: `
        <h3 style="color: #003b7a; margin-top: 0;">Información de la Solicitud</h3>
        <div class="detail-item"><span class="detail-label">ID Préstamo:</span> ${prestamo.ID_Prestamo}</div>
        <div class="detail-item"><span class="detail-label">Solicitante:</span> ${solicitud.usuario.Nombre_Completo}</div>
        <div class="detail-item"><span class="detail-label">Equipo:</span> ${solicitud.equipo.Modelo} (${solicitud.equipo.ID_Num_Inv})</div>
      `,
      actions: `
        <a href="${FRONTEND_URL || "http://localhost:5173"}/" class="button">Acceder al Sistema</a>
      `,
      color: "#003b7a"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: emails,
      subject: "📢 Notificación: Solicitud Aprobada para Entrega - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Notificación de aprobación enviada a los administradores: ${emails}`);
  } catch (error) {
    console.error("Error al enviar email de notificación a admins:", error);
  }
}

/**
 * Enviar correo de equipo entregado
 */
export async function enviarEmailEquipoEntregado(solicitud, prestamo) {
  try {
    const attachments = await getCommonAttachments();
    
    // [NUEVO] Si el préstamo tiene un acta firmada, adjuntarla al correo
    if (prestamo && prestamo.Documento_Suscrito) {
      const fullPath = path.join(process.cwd(), prestamo.Documento_Suscrito);
      if (fs.existsSync(fullPath)) {
        attachments.push({
          filename: 'Acta_Suscrita_SIREC.pdf',
          path: fullPath
        });
        console.log(`📎 Acta firmada adjuntada al correo para: ${solicitud.usuario.Correo}`);
      }
    }

    const equipmentInfo = formatEquipoDetails(solicitud.equipo);

    const html = getUnifiedEmailTemplate({
      title: "Equipo Entregado",
      greeting: `${solicitud.usuario.Nombre_Completo}`,
      intro: `Se ha registrado la entrega del equipo bajo tu responsabilidad.`,
      details: `
        <h3 style="color: #003b7a; margin-top: 0;">Equipo en Préstamo</h3>
        ${equipmentInfo}
        <h3 style="color: #003b7a; margin-bottom: 5px;">Compromiso de Devolución</h3>
        <div class="detail-item">
          <span class="detail-label">Fecha de Devolución:</span> 
          <strong>${prestamo.Fecha_fin_prestamo ? new Date(prestamo.Fecha_fin_prestamo).toLocaleDateString('es-CL') : (solicitud.Fecha_termino_sol ? new Date(solicitud.Fecha_termino_sol).toLocaleDateString('es-CL') : new Date(prestamo.Fecha_inicio_prestamo).toLocaleDateString('es-CL'))}</strong>
        </div>
      `,
      actions: `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; font-size: 13px; text-align: left;">
          <strong>Recordatorio:</strong>
          <ul>
            <li>Eres responsable del cuidado y buen uso del equipo.</li>
            <li>Cualquier avería debe ser informada inmediatamente.</li>
            <li>El retraso en la devolución puede generar sanciones.</li>
          </ul>
        </div>
      `,
      color: "#003b7a"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: solicitud.usuario.Correo,
      subject: "📦 Equipo Entregado - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de equipo entregado enviado a: ${solicitud.usuario.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de equipo entregado:", error);
  }
}

/**
 * Enviar correo de equipo devuelto
 */
export async function enviarEmailEquipoDevuelto(solicitud, devolucion, prestamo = null) {
  try {
    const attachments = await getCommonAttachments();
    
    // Si la solicitud no tiene el equipo cargado (puede pasar en relaciones anidadas),
    // intentamos sacarlo del préstamo si está disponible.
    const equipo = solicitud.equipo || prestamo?.equipos;
    const equipmentInfo = formatEquipoDetails(equipo);
    
    // Formateo seguro de la fecha de devolución
    let fechaDevText = "No especificada";
    try {
      const fechaBase = devolucion.Fecha_Dev || new Date();
      const dateObj = new Date(fechaBase);
      if (!isNaN(dateObj.getTime())) {
        fechaDevText = dateObj.toLocaleString('es-CL');
      } else {
        fechaDevText = new Date().toLocaleString('es-CL');
      }
    } catch (e) {
      fechaDevText = new Date().toLocaleString('es-CL');
    }

    const html = getUnifiedEmailTemplate({
      title: "Devolución Exitosa",
      greeting: `${solicitud.usuario?.Nombre_Completo || 'Usuario'}`,
      intro: `Se ha registrado correctamente la devolución del equipo. El préstamo ha finalizado.`,
      details: `
        <h3 style="color: #28a745; margin-top: 0;">Equipo Devuelto</h3>
        ${equipmentInfo}
        <h3 style="color: #28a745; margin-bottom: 5px;">Detalles de Recepción</h3>
        <div class="detail-item">
          <span class="detail-label">Fecha de Devolución:</span> 
          ${fechaDevText}
        </div>
        <div class="detail-item"><span class="detail-label">Estado:</span> ${devolucion.Estado_Equipo_Devolucion || "Recibido Conforme"}</div>
        ${devolucion.Obs_Dev ? `<div class="detail-item"><span class="detail-label">Observaciones:</span> ${devolucion.Obs_Dev}</div>` : ""}
      `,
      actions: `<p style="color: #28a745; font-weight: bold;">¡Gracias por utilizar el sistema y cuidar el equipo!</p>`,
      color: "#28a745"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: solicitud.usuario.Correo,
      subject: "✅ Devolución de Equipo Registrada - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de equipo devuelto enviado a: ${solicitud.usuario.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de equipo devuelto:", error);
  }
}

/**
 * Enviar correo de solicitud rechazada
 */
export async function enviarEmailSolicitudRechazada(solicitud, observaciones) {
  try {
    const attachments = await getCommonAttachments();
    const equipmentInfo = formatEquipoDetails(solicitud.equipo);

    const html = getUnifiedEmailTemplate({
      title: "Solicitud Rechazada",
      greeting: `${solicitud.usuario.Nombre_Completo}`,
      intro: `Lamentamos informarte que tu solicitud de préstamo no ha sido autorizada en esta ocasión.`,
      details: `
        <h3 style="color: #dc3545; margin-top: 0;">Información de la Solicitud</h3>
        ${equipmentInfo}
        <div style="background-color: #ffebee; border-left: 4px solid #dc3545; padding: 15px; margin-top: 15px;">
          <p style="margin: 0; color: #c62828;"><strong>Motivo del Rechazo:</strong></p>
          <p style="margin: 5px 0 0 0;">${observaciones || "No especificado"}</p>
        </div>
      `,
      actions: `<p>Si tienes dudas, puedes consultar con la administración de equipos.</p>`,
      color: "#dc3545"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: solicitud.usuario.Correo,
      subject: "❌ Solicitud Rechazada - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de solicitud rechazada enviado a: ${solicitud.usuario.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de solicitud rechazada:", error);
  }
}
/**
 * Enviar correo de notificación por rechazo automático tras 48 horas
 */
export async function enviarEmailSolicitudRechazadaAutomatico(solicitud) {
  try {
    const attachments = await getCommonAttachments();
    const equipmentInfo = formatEquipoDetails(solicitud.equipo);

    const html = getUnifiedEmailTemplate({
      title: "Solicitud Expirada",
      greeting: `${solicitud.usuario.Nombre_Completo}`,
      intro: `Tu solicitud de préstamo ha sido rechazada automáticamente debido a que ha expirado el plazo de 48 horas para su aprobación por parte de la dirección.`,
      details: `
        <h3 style="color: #dc3545; margin-top: 0;">Información de la Solicitud</h3>
        ${equipmentInfo}
        <div style="background-color: #ffebee; border-left: 4px solid #dc3545; padding: 15px; margin-top: 15px;">
          <p style="margin: 0; color: #c62828;"><strong>Estado:</strong> Expirada (48 horas sin acción)</p>
        </div>
        <div class="detail-item"><span class="detail-label">ID Solicitud:</span> ${solicitud.ID_Solicitud}</div>
      `,
      actions: `
        <p>Puedes intentar realizar una nueva solicitud o consultar directamente con tu Director de Escuela si consideras que hubo un error.</p>
      `,
      color: "#dc3545"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: solicitud.usuario.Correo,
      subject: "⏰ Solicitud Expirada y Rechazada - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de rechazo automático enviado a: ${solicitud.usuario.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de rechazo automático:", error);
  }
}

/**
 * Enviar correo de aviso de atraso (Cron Job)
 */
export async function enviarEmailAvisoAtraso(solicitud, diasRetraso, fechaLimite) {
  try {
    const attachments = await getCommonAttachments();
    const equipmentInfo = formatEquipoDetails(solicitud.equipo);
    
    const html = getUnifiedEmailTemplate({
      title: "Aviso de Retraso",
      greeting: `${solicitud.usuario.Nombre_Completo}`,
      intro: `Te informamos que el préstamo del equipo bajo tu responsabilidad se encuentra <strong>vencido</strong> por ${diasRetraso} día(s).`,
      details: `
        <h3 style="color: #dc3545; margin-top: 0;">Equipo Vencido</h3>
        ${equipmentInfo}
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 15px;">
           <p><strong>Fecha Límite:</strong> ${fechaLimite.toLocaleDateString('es-CL')}</p>
           <p><strong>Días de Retraso:</strong> ${diasRetraso}</p>
        </div>
        <p style="margin-top: 15px; font-weight: bold;">
          Por favor, devuelve el equipo a la brevedad para evitar mayores sanciones.
        </p>
      `,
      actions: `
         <p>Si ya devolviste el equipo, por favor omite este mensaje.</p>
      `,
      color: "#dc3545"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: solicitud.usuario.Correo,
      subject: "⚠️ Aviso de Préstamo Vencido - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de aviso de atraso enviado a: ${solicitud.usuario.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de aviso de atraso:", error);
  }
}

/**
 * Enviar correo de notificación de sanción
 */
export async function enviarEmailSancion(solicitud, penalizacion, fechaFinSancion, diasRetraso) {
  try {
    const attachments = await getCommonAttachments();
    
    const html = getUnifiedEmailTemplate({
      title: "Notificación de Sanción",
      greeting: `${solicitud.usuario.Nombre_Completo}`,
      intro: `Le informamos que se ha aplicado una sanción a su cuenta debido a un incumplimiento en los plazos de devolución.`,
      details: `
        <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; border-radius: 4px; color: #721c24;">
            <h3 style="margin-top: 0; color: #721c24;">Detalles de la Sanción</h3>
            <p><strong>Motivo:</strong> ${penalizacion.Descripcion}</p>
            <p><strong>Días de Retraso:</strong> ${diasRetraso}</p>
            <p><strong>Duración del bloqueo:</strong> ${penalizacion.Dias_Sancion || 0} dias</p>
            <p style="font-size: 16px;"><strong>Fecha de Término:</strong> ${fechaFinSancion.toLocaleDateString('es-CL')}</p>
        </div>
        <p style="margin-top: 15px;">
           Durante este período, no podrá realizar nuevas solicitudes de préstamo en el sistema.
        </p>
      `,
      actions: `
         <p>Si tiene consultas respecto a esta sanción, por favor diríjase a la administración del laboratorio.</p>
      `,
      color: "#dc3545"
    });

    await sendEmailWrapper({
      from: `"SIREC UBB" <${emailConfig.user}>`,
      to: solicitud.usuario.Correo,
      subject: "🚫 Notificación de Sanción - SIREC UBB",
      html: html,
      attachments: attachments
    });

    console.log(`✉️ Email de sanción enviado a: ${solicitud.usuario.Correo}`);
  } catch (error) {
    console.error("Error al enviar email de sanción:", error);
  }
}
