# AulaTech - Gestión de Recursos Audiovisuales

API Backend para la gestión de reservas y reportes de equipos audiovisuales universitarios.

## Descripción del Proyecto

AulaTech es una plataforma que permite a docentes y estudiantes reservar equipos audiovisuales, reportar fallas y gestionar incidencias técnicas de manera eficiente.

## Tecnologías Utilizadas

- **Node.js** con **Express** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **Jest** y **Supertest** - Testing
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

## Requisitos Previos

- Node.js v16 o superior
- PostgreSQL v12 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
\`\`\`bash
git clone <url-del-repositorio>
cd aulatech-backend
\`\`\`

2. Instalar dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configurar variables de entorno:
\`\`\`bash
cp .env.example .env
# Editar .env con tus credenciales
\`\`\`

4. Crear la base de datos en PostgreSQL:
\`\`\`sql
CREATE DATABASE aulatech_db;
\`\`\`

5. Iniciar el servidor en modo desarrollo:
\`\`\`bash
npm run dev
\`\`\`

## Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm test` - Ejecutar tests con cobertura
- `npm run test:watch` - Ejecutar tests en modo watch
- `npm run test:integration` - Ejecutar solo tests de integración

## Estructura del Proyecto

\`\`\`
aulatech-backend/
├── src/
│   ├── config/          # Configuraciones (DB, etc.)
│   ├── models/          # Modelos de Sequelize
│   │   ├── user.model.js
│   │   ├── equipment.model.js
│   │   ├── reservation.model.js
│   │   ├── report.model.js
│   │   └── index.js
│   ├── controllers/     # Controladores de rutas
│   │   ├── auth.controller.js
│   │   ├── equipment.controller.js
│   │   ├── reservation.controller.js
│   │   └── report.controller.js
│   ├── routes/          # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── equipment.routes.js
│   │   ├── reservation.routes.js
│   │   └── report.routes.js
│   ├── middlewares/     # Middlewares personalizados
│   │   └── auth.middleware.js
│   ├── utils/           # Utilidades y helpers
│   │   ├── jwt.js
│   │   └── logger.js
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
├── __tests__/           # Tests con Jest y Supertest
│   ├── setup.js
│   ├── health.test.js
│   ├── auth.test.js
│   ├── equipment.test.js
│   ├── reservations.test.js
│   ├── reports.test.js
│   └── integration.test.js
├── .env.example         # Ejemplo de variables de entorno
├── .gitignore
├── package.json
├── README.md
└── TESTING.md           # Documentación de tests
\`\`\`

## Historias de Usuario Implementadas

### Alta Prioridad
- ✅ **HU01**: Reservar equipos audiovisuales
- ✅ **HU02**: Reportar daños en equipos
- ✅ **HU04**: Cancelar reservas
- ✅ **HU06**: Seguimiento de incidentes (técnicos)

### Media Prioridad
- ⚠️ **HU03**: Confirmación de reserva por correo (pendiente)
- ✅ **HU05**: Ver historial de reservas

## Roles de Usuario

- **Docente**: Puede reservar equipos, ver historial y cancelar reservas
- **Estudiante**: Puede reportar fallas en equipos
- **Técnico**: Puede gestionar incidentes, reportes y equipos

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Equipos
- `GET /api/equipment` - Listar equipos disponibles
- `GET /api/equipment/:id` - Obtener detalles de equipo
- `POST /api/equipment` - Crear equipo (solo técnicos)
- `PATCH /api/equipment/:id` - Actualizar equipo (solo técnicos)

### Reservas
- `POST /api/reservations` - Crear reserva (HU01)
- `GET /api/reservations/my` - Listar mis reservas (HU05)
- `GET /api/reservations` - Listar todas las reservas (solo técnicos)
- `DELETE /api/reservations/:id` - Cancelar reserva (HU04)

### Reportes
- `POST /api/reports` - Crear reporte de falla (HU02)
- `GET /api/reports` - Listar todos los reportes (solo técnicos, HU06)
- `GET /api/reports/my` - Listar mis reportes
- `GET /api/reports/stats` - Estadísticas de reportes (solo técnicos)
- `GET /api/reports/:id` - Obtener reporte por ID
- `PATCH /api/reports/:id` - Actualizar estado de reporte (solo técnicos, HU06)

## Testing

Ver documentación completa en [TESTING.md](./TESTING.md)

Ejecutar todos los tests:
\`\`\`bash
npm test
\`\`\`

Cobertura actual:
- Branches: >70%
- Functions: >70%
- Lines: >70%
- Statements: >70%

## Contribución

1. Crear una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits descriptivos: `git commit -m "feat: agregar endpoint de reservas"`
3. Ejecutar tests: `npm test`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Convenciones de Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `test:` Agregar o modificar tests
- `refactor:` Refactorización de código
- `chore:` Tareas de mantenimiento

## Entregables del Proyecto

### ✅ Completados

1. **Repositorio en Git**
   - Estructura organizada de carpetas
   - Commits descriptivos y frecuentes
   - Control de versiones con .gitignore

2. **API Backend con Express**
   - Servidor configurado con Express
   - Rutas RESTful organizadas
   - Middlewares de autenticación y autorización

3. **Base de Datos con Sequelize**
   - Modelos: User, Equipment, Reservation, Report
   - Relaciones entre modelos
   - Migraciones automáticas en desarrollo

4. **Cobertura de Pruebas**
   - Tests unitarios con Jest
   - Tests de integración con Supertest
   - Cobertura >70% en todas las métricas

5. **Historias de Usuario**
   - HU01: Reservar equipos ✅
   - HU02: Reportar fallas ✅
   - HU04: Cancelar reservas ✅
   - HU05: Ver historial ✅
   - HU06: Gestión de incidentes ✅

## Licencia

MIT

## Contacto

Proyecto desarrollado para Ingeniería de Software 2 - Unicomfacauca
