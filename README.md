# Proyecto_TallerDeDesarrollo_2025-1

Proyecto de software para la reserva de computadores y otros equipos tecnológicos en la FACE.

# 🎓 Sistema de Reserva de Equipos - FACE

**Proyecto de software para la gestión de reservas de notebooks y otros equipos tecnológicos en la Facultad de Ciencias Empresariales (FACE).**

Este sistema permite a estudiantes, encargados y administrativos gestionar de forma ágil y controlada el **préstamo de equipos** desde una plataforma web centralizada.

---

## ✨ Funcionalidades principales

- 📝 **Solicitud en línea** por parte del estudiante, mediante una interfaz clara e intuitiva.
- 🔄 **Flujo de autorización por etapas**:
  - Encargado
  - Jefe de carrera
  - Administrador
- 📦 **Seguimiento en tiempo real** del estado de la solicitud (estilo AliExpress):
  - `Recibido`, `Esperando confirmación`, `Firmar documento`, `Listo para retiro`, etc.
- 🧾 **Firma digital de documento de compromiso** y carga de permisos.
- 🗂 **Gestión de inventario** y control de disponibilidad de los equipos.
- 👥 **Roles diferenciados**: Alumno, Encargado, Administrador.
- 📊 **Panel de administración** con control completo del sistema.

---

## ⚙️ Tecnologías utilizadas

| Capa        | Herramientas                    |
|-------------|----------------------------------|
| Frontend    | `React`, `Material UI`, `SweetAlert2` |
| Backend     | `Node.js`, `Express`            |
| Base de datos | `PostgreSQL`                  |
| Autenticación | `JWT`                         |
| Infraestructura | `Docker`, `Ubuntu Server`   |

---

## 🚀 Instalación y ejecución con Docker

### Prerrequisitos
- Docker
- Docker Compose

### Pasos para ejecutar el proyecto

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd "Taller de desarrollo"
   ```

2. **Configura las variables de entorno:**
   - Backend: `./backend/src/config/.env`
   - Frontend: `./frontend/.env`

3. **Construye y ejecuta los contenedores:**
   ```bash
   docker-compose up --build
   ```

4. **Accede a la aplicación:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - Base de datos: localhost:5432

### Comandos útiles

```bash
# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener los contenedores
docker-compose down

# Reiniciar un servicio específico
docker-compose restart backend

# Acceder a la consola de la base de datos
docker-compose exec postgres psql -U postgres -d reserva_equipos
```

### Credenciales por defecto

- **Administrador:** 
  - Email: administrador2024@gmail.cl
  - Password: admin1234

- **Usuario:** 
  - Email: usuario1.2024@gmail.cl
  - Password: user1234

---

## 🎯 Objetivo del proyecto

> Desarrollar una solución eficiente, segura y escalable que permita optimizar el uso de recursos tecnológicos en la FACE, garantizando **transparencia**, **trazabilidad** y **facilidad de uso** para toda la comunidad académica.

---

## 🚧 Estado del proyecto

🔨 En desarrollo bajo la metodología **incremental**, permitiendo liberar funcionalidades de forma progresiva y validarlas con usuarios reales.

---

## 📁 Estructura del proyecto

```
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```
