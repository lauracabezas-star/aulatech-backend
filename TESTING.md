# Guía de Testing - AulaTech

## Estructura de Tests

El proyecto utiliza **Jest** y **Supertest** para testing automatizado con cobertura de código.

### Archivos de Test

\`\`\`
__tests__/
├── setup.js              # Configuración global de tests
├── health.test.js        # Tests básicos de salud del API
├── auth.test.js          # Tests de autenticación (HU - Auth)
├── equipment.test.js     # Tests de gestión de equipos
├── reservations.test.js  # Tests de reservas (HU01, HU04, HU05)
├── reports.test.js       # Tests de reportes (HU02, HU06)
└── integration.test.js   # Tests de integración end-to-end
\`\`\`

## Ejecutar Tests

### Todos los tests con cobertura
\`\`\`bash
npm test
\`\`\`

### Tests en modo watch (desarrollo)
\`\`\`bash
npm run test:watch
\`\`\`

### Solo tests de integración
\`\`\`bash
npm run test:integration
\`\`\`

## Cobertura de Código

El proyecto está configurado con umbrales mínimos de cobertura:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Ver reporte de cobertura en: `coverage/lcov-report/index.html`

## Historias de Usuario Cubiertas

### HU01 - Reservar un videobeam
- ✅ Crear reserva con disponibilidad en tiempo real
- ✅ Validar que no haya traslape de horarios
- ✅ Confirmación inmediata de reserva

**Archivo**: `__tests__/reservations.test.js`

### HU02 - Reportar daño en equipo
- ✅ Crear reporte con descripción escrita
- ✅ Adjuntar foto de la falla
- ✅ Generar ticket único con estado "pendiente"

**Archivo**: `__tests__/reports.test.js`

### HU03 - Confirmación de reserva por correo
- ⚠️ Pendiente de implementación (requiere configuración de email)

### HU04 - Cancelar una reserva
- ✅ Cancelar reserva y liberar equipo
- ✅ No permitir cancelar reservas que ya comenzaron
- ✅ Actualizar historial con estado "cancelada"

**Archivo**: `__tests__/reservations.test.js`

### HU05 - Ver historial de reservas
- ✅ Listar reservas del usuario
- ✅ Ordenar por fecha (más reciente primero)
- ✅ Filtrar por estado

**Archivo**: `__tests__/reservations.test.js`

### HU06 - Seguimiento de incidentes
- ✅ Listar reportes ordenados por prioridad y fecha
- ✅ Actualizar estado de reportes (pendiente → en proceso → resuelto)
- ✅ Asignar técnico a reporte
- ✅ Ver estadísticas de reportes

**Archivo**: `__tests__/reports.test.js`

## Tests de Integración

El archivo `integration.test.js` contiene un flujo completo que simula:

1. Registro de usuarios (docente, estudiante, técnico)
2. Técnico crea equipo
3. Docente consulta equipos disponibles
4. Docente crea reserva (HU01)
5. Docente ve su historial (HU05)
6. Estudiante reporta falla (HU02)
7. Técnico ve reportes (HU06)
8. Técnico actualiza estado del reporte
9. Técnico resuelve el reporte
10. Estudiante verifica estado del reporte
11. Docente cancela reserva (HU04)
12. Técnico ve estadísticas

## Buenas Prácticas

### Antes de cada commit
\`\`\`bash
npm test
\`\`\`

### Estructura de un test
\`\`\`javascript
describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup inicial
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should do something specific', async () => {
    // Arrange
    const data = { ... };

    // Act
    const response = await request(app)
      .post('/api/endpoint')
      .send(data);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('key');
  });
});
\`\`\`

## Base de Datos de Test

Los tests utilizan una base de datos en memoria que se crea y destruye automáticamente:
- `beforeAll`: Sincroniza modelos con `{ force: true }`
- `afterAll`: Cierra conexión a la base de datos

## Debugging Tests

Para ver logs durante tests, comenta las líneas en `__tests__/setup.js`:

\`\`\`javascript
// global.console = {
//   ...console,
//   log: jest.fn(),
// };
\`\`\`

## CI/CD

Los tests se ejecutan automáticamente en:
- Pull Requests
- Push a rama principal
- Antes de deployment

## Próximos Tests a Implementar

- [ ] Tests de email (HU03)
- [ ] Tests de performance
- [ ] Tests de seguridad
- [ ] Tests de carga con múltiples usuarios concurrentes
