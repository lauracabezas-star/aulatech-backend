// Import Jest module
const jest = require("jest")

// Configuración global para tests
process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test-secret-key-for-testing"

// Aumentar timeout para tests de integración
jest.setTimeout(10000)

// Suprimir logs durante tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}
