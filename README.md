# SIREC UBB - Sistema de Reserva de Equipos

**SIREC UBB** es el sistema oficial para la gestión y reserva de equipos tecnológicos en la Facultad de Ciencias Empresariales (FACE). Este sistema permite optimizar el uso de recursos, garantizando trazabilidad y transparencia en los préstamos a la comunidad académica.

---

## 🛠️ Tecnologías y Propósito

El sistema SIREC UBB utiliza un ecosistema moderno compuesto por diversas herramientas seleccionadas para garantizar escalabilidad, seguridad y una experiencia de usuario rápida y eficiente. A continuación, el Stack Tecnológico completo del proyecto:

### 🗄️ 1. Base de Datos y Almacenamiento
* **PostgreSQL**: Motor de base de datos relacional primario y robusto.
* **pg (node-postgres)**: Controlador nativo para la conexión de Node.js a PostgreSQL.

### ⚙️ 2. Desarrollo Backend (Lógica y API REST)
* **Node.js**: Entorno de ejecución JavaScript del lado del servidor.
* **Express.js**: Framework web minimalista para la creación de la API RESTful.
* **TypeORM**: Mapeador Objeto-Relacional (ORM) para modelado robusto de base de datos.
* **JWT & Passport**: Estandarización de autenticación stateless y protección de rutas.
* **Bcrypt.js**: Encriptación de contraseñas de usuarios mediante hashing seguro.
* **Nodemailer**: Transporte de correos electrónicos automáticos (vía Gmail SMTP).
* **PDFKit**: Generador dinámico de documentos y actas de préstamo.
* **Multer**: Middleware para carga y parseo eficiente de archivos de imagen y datos.
* **Joi**: Validador estricto de esquemas en peticiones HTTP entrantes.
* **Morgan**: Logger fundamental de tráfico HTTP para auditoría.

### 🎨 3. Desarrollo Frontend (Interfaz de Usuario)
* **React.js**: Librería líder para construir la interfaz reactiva del usuario basada en componentes.
* **Vite**: Empaquetador modular de ultra-alta velocidad y servidor de desarrollo.
* **CSS Puro (Vanilla)**: Hoja de estilos estricta para máximo control visual, eludiendo dependencias externas.
* **React Router DOM**: Enrutador clave de navegación para experiencia Single Page Application.
* **Axios**: Cliente HTTP para consumos e intercepciones a la API del Backend.
* **React Hook Form**: Gestión ágil de estados y validaciones complejas de entrada.
* **SweetAlert2**: Sistema elegante de alertas, confirmaciones modales y notificaciones.
* **Chart.js & react-chartjs-2**: Generación dinámica del Panel estadístico de Reportes.
* **React Select**: Componentes avanzados de auto-completado y etiquetas para selectores masivos.
* **React Tabulator**: Presentación de mega-tablas con rendimiento nativo ultra alto.

### 💻 4. Entorno de Desarrollo y Despliegue
* **Visual Studio Code**: Editor de código fuente ligero, rápido y versátil.
* **Antigravity (IA Editor)**: Co-piloto algorítmico y entorno con IA usado integralmente a lo largo del ciclo de refactorización y depuración del sistema.
* **Git & GitHub**: Control de versiones seguro y gestión de hitos del código.
* **PM2 & Nodemon**: Managers de procesos orientados a producción (permanencia) y desarrollo (auto-recarga).

---

## 🚀 Manual de Instalación y Configuración

Siga estos pasos para configurar el entorno local o de producción.

### 1. Clonar el repositorio

```bash
git clone https://github.com/LeonardoGutierrezS/SIREC_UBB_2026.git
cd SIREC_UBB_2026
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
pm2 start src/index.js --name "sirec-backend"
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
pm2 start npm --name "sirec-frontend" -- run preview
```

### Comandos Útiles de PM2

- **Listar procesos**: `pm2 list`
- **Ver logs**: `pm2 logs`
- **Reiniciar todo**: `pm2 restart all`
- **Guardar configuración**: `pm2 save` (para que inicien tras un reboot del servidor)

---

## 📊 Configuración Inicial

Una vez levantados los servicios, el sistema ejecutará automáticamente la configuración base del esquema de base de datos y los datos iniciales (roles, categorías) necesarios para el primer inicio de sesión.

---

## ✒️ Autoría y Créditos

> **Desarrollado por:** [Leonardo Gutierrez Sanchez](https://github.com/LeonardoGutierrezS)  
> **Proyecto:** SIREC UBB (Sistema de Reserva de Equipos)  
> **Versión:** 5.0.0  
> **Año:** 2026

---

© 2026 SIREC UBB - Todos los derechos reservados.
