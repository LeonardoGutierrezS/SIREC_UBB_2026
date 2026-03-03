# SIREC UBB - Sistema de Reserva de Equipos

**SIREC UBB** es el sistema oficial para la gestión y reserva de equipos tecnológicos en la Facultad de Ciencias Empresariales (FACE). Este sistema permite optimizar el uso de recursos, garantizando trazabilidad y transparencia en los préstamos a la comunidad académica.

---

## 🛠️ Tecnologías y Propósito

El sistema utiliza un stack moderno para asegurar rendimiento, escalabilidad y una experiencia de usuario fluida:

| Tecnología                | Propósito                                                                                                               |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| **Node.js & Express**     | Motor del Backend, encargado de la lógica de negocio, API REST y gestión de procesos.                                   |
| **React (Vite)**          | Biblioteca de Frontend para crear una interfaz de usuario dinámica, receptiva y de alto rendimiento.                    |
| **PostgreSQL**            | Base de datos relacional para el almacenamiento seguro y persistente de la información de usuarios, equipos y reservas. |
| **PM2**                   | Gestor de procesos utilizado para mantener el sistema activo 24/7, permitiendo reinicios automáticos y monitoreo.       |
| **JWT (JSON Web Tokens)** | Estándar para la autenticación segura de usuarios y control de acceso basado en roles.                                  |
| **Material UI (MUI)**     | Sistema de diseño profesional para componentes visuales consistentes y estéticos.                                       |

---

## 🚀 Manual de Instalación y Configuración

Siga estos pasos para configurar el entorno local o de producción.

### 1. Clonar el repositorio

```bash
git clone https://github.com/LeonardoGutierrezS/Proyecto_TallerDeDesarrollo_2025-1.git
cd Proyecto_TallerDeDesarrollo_2025-1
```

### 2. Configurar Variables de Entorno

Debe crear un archivo `.env` en la carpeta `backend/src/config/` con los siguientes parámetros:

```env
PORT=3000
HOST=localhost
DB_USERNAME=tu_usuario_postgres
PASSWORD=tu_contraseña_postgres
DATABASE=sirec_db
ACCESS_TOKEN_SECRET=un_secreto_seguro_aqui
FRONTEND_URL=http://localhost:5173
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

**Frontend:**
Cree un archivo `.env` en la carpeta `frontend/` con el siguiente parámetro:

```env
VITE_BASE_URL=http://localhost:3000/api
```

### 3. Instalación de Dependencias

Instale los paquetes necesarios para ambos extremos del sistema:

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd ../frontend
npm install
```

---

## 📦 Despliegue con PM2

PM2 es esencial para asegurar que los servicios de SIREC UBB se mantengan en ejecución.

### Despliegue del Backend

Desde la carpeta `backend`, ejecute:

```bash
pm2 start src/server.js --name "sirec-backend"
```

### Despliegue del Frontend

Para el frontend, primero debe generar la construcción de producción y luego servirla:

1. Generar build:

```bash
cd ../frontend
npm run build
```

2. Servir con PM2 (usando un servidor estático como `serve`):

```bash
pm2 serve dist 5173 --name "sirec-frontend" --spa
```

### Comandos Útiles de PM2

- **Listar procesos**: `pm2 list`
- **Ver logs**: `pm2 logs`
- **Reiniciar todo**: `pm2 restart all`
- **Guardar configuración**: `pm2 save` (para que inicien tras un reboot del servidor)

---

## 📊 Configuración Inicial

Una vez levantados los servicios, el sistema ejecutará automáticamente la configuración base del esquema de base de datos y los datos iniciales (roles, categorías) necesarios para el primer inicio de sesión.
