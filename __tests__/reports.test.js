const request = require("supertest")
const app = require("../src/app")
const { sequelize, User, Equipment, Report } = require("../src/models")

let estudianteToken, tecnicoToken, equipmentId

beforeAll(async () => {
  await sequelize.sync({ force: true })

  // Crear usuario estudiante
  const estudianteResponse = await request(app).post("/api/auth/register").send({
    email: "estudiante@test.com",
    password: "password123",
    firstName: "María",
    lastName: "García",
    role: "estudiante",
  })

  estudianteToken = estudianteResponse.body.token

  // Crear técnico
  const tecnicoResponse = await request(app).post("/api/auth/register").send({
    email: "tecnico@test.com",
    password: "password123",
    firstName: "Carlos",
    lastName: "Técnico",
    role: "tecnico",
  })

  tecnicoToken = tecnicoResponse.body.token

  // Crear equipo
  const equipmentResponse = await request(app)
    .post("/api/equipment")
    .set("Authorization", `Bearer ${tecnicoToken}`)
    .send({
      name: "Computador HP",
      type: "computador",
      serialNumber: "PC-001",
      brand: "HP",
      model: "ProBook 450",
      location: "Sala de cómputo A",
    })

  equipmentId = equipmentResponse.body.equipment.id
})

afterAll(async () => {
  await sequelize.close()
})

describe("Report Endpoints", () => {
  let reportId

  describe("POST /api/reports - HU02", () => {
    it("should create a report with description", async () => {
      const reportData = {
        equipmentId,
        description: "El computador no enciende, la pantalla permanece en negro",
        priority: "alta",
      }

      const response = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${estudianteToken}`)
        .send(reportData)
        .expect(201)

      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("report")
      expect(response.body.report.status).toBe("pendiente")
      expect(response.body.report.ticketNumber).toMatch(/^TKT-/)
      expect(response.body.report.description).toBe(reportData.description)

      reportId = response.body.report.id
    })

    it("should create a report with photo", async () => {
      const reportData = {
        equipmentId,
        description: "Pantalla rota",
        photoUrl: "https://example.com/photo.jpg",
        priority: "urgente",
      }

      const response = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${estudianteToken}`)
        .send(reportData)
        .expect(201)

      expect(response.body.report.photoUrl).toBe(reportData.photoUrl)
      expect(response.body.report.priority).toBe("urgente")
    })

    it("should require description", async () => {
      const reportData = {
        equipmentId,
      }

      const response = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${estudianteToken}`)
        .send(reportData)
        .expect(400)

      expect(response.body).toHaveProperty("errors")
    })
  })

  describe("GET /api/reports - HU06", () => {
    it("should get all reports for technicians", async () => {
      const response = await request(app).get("/api/reports").set("Authorization", `Bearer ${tecnicoToken}`).expect(200)

      expect(response.body).toHaveProperty("count")
      expect(response.body).toHaveProperty("reports")
      expect(Array.isArray(response.body.reports)).toBe(true)
      expect(response.body.count).toBeGreaterThan(0)
    })

    it("should not allow non-technicians to view all reports", async () => {
      const response = await request(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${estudianteToken}`)
        .expect(403)

      expect(response.body).toHaveProperty("error")
    })

    it("should filter reports by status", async () => {
      const response = await request(app)
        .get("/api/reports?status=pendiente")
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .expect(200)

      expect(response.body.reports.every((r) => r.status === "pendiente")).toBe(true)
    })
  })

  describe("GET /api/reports/my", () => {
    it("should get user's own reports", async () => {
      const response = await request(app)
        .get("/api/reports/my")
        .set("Authorization", `Bearer ${estudianteToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("reports")
      expect(response.body.count).toBeGreaterThan(0)
    })
  })

  describe("PATCH /api/reports/:id - HU06", () => {
    it("should update report status to in progress", async () => {
      const response = await request(app)
        .patch(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .send({
          status: "en_proceso",
        })
        .expect(200)

      expect(response.body.report.status).toBe("en_proceso")
      expect(response.body.report.assignedToId).toBeTruthy()
    })

    it("should update report status to resolved", async () => {
      const response = await request(app)
        .patch(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .send({
          status: "resuelto",
          resolution: "Se reemplazó la fuente de poder",
        })
        .expect(200)

      expect(response.body.report.status).toBe("resuelto")
      expect(response.body.report.resolution).toBe("Se reemplazó la fuente de poder")
      expect(response.body.report.resolvedAt).toBeTruthy()
    })

    it("should not allow non-technicians to update reports", async () => {
      const response = await request(app)
        .patch(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${estudianteToken}`)
        .send({
          status: "resuelto",
        })
        .expect(403)

      expect(response.body).toHaveProperty("error")
    })
  })

  describe("GET /api/reports/stats", () => {
    it("should get report statistics", async () => {
      const response = await request(app)
        .get("/api/reports/stats")
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("pending")
      expect(response.body).toHaveProperty("inProgress")
      expect(response.body).toHaveProperty("resolved")
    })
  })
})
