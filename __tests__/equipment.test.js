const request = require("supertest")
const app = require("../src/app")
const { sequelize, User, Equipment } = require("../src/models")

let tecnicoToken, docenteToken

beforeAll(async () => {
  await sequelize.sync({ force: true })

  // Crear técnico
  const tecnicoResponse = await request(app).post("/api/auth/register").send({
    email: "tecnico@test.com",
    password: "password123",
    firstName: "Carlos",
    lastName: "Técnico",
    role: "tecnico",
  })

  tecnicoToken = tecnicoResponse.body.token

  // Crear docente
  const docenteResponse = await request(app).post("/api/auth/register").send({
    email: "docente@test.com",
    password: "password123",
    firstName: "Juan",
    lastName: "Pérez",
    role: "docente",
  })

  docenteToken = docenteResponse.body.token
})

afterAll(async () => {
  await sequelize.close()
})

describe("Equipment Endpoints", () => {
  let equipmentId

  describe("POST /api/equipment", () => {
    it("should create equipment as technician", async () => {
      const equipmentData = {
        name: "Videobeam Epson",
        type: "videobeam",
        serialNumber: "VB-001",
        brand: "Epson",
        model: "EB-X41",
        location: "Edificio A - Sala 101",
        description: "Videobeam de alta resolución",
      }

      const response = await request(app)
        .post("/api/equipment")
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .send(equipmentData)
        .expect(201)

      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("equipment")
      expect(response.body.equipment.name).toBe(equipmentData.name)
      expect(response.body.equipment.status).toBe("disponible")

      equipmentId = response.body.equipment.id
    })

    it("should not allow non-technicians to create equipment", async () => {
      const equipmentData = {
        name: "Computador HP",
        type: "computador",
        serialNumber: "PC-001",
        brand: "HP",
        location: "Sala B",
      }

      const response = await request(app)
        .post("/api/equipment")
        .set("Authorization", `Bearer ${docenteToken}`)
        .send(equipmentData)
        .expect(403)

      expect(response.body).toHaveProperty("error")
    })

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/equipment")
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .send({
          name: "Test",
        })
        .expect(400)

      expect(response.body).toHaveProperty("errors")
    })
  })

  describe("GET /api/equipment", () => {
    it("should get all equipment", async () => {
      const response = await request(app)
        .get("/api/equipment")
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("count")
      expect(response.body).toHaveProperty("equipment")
      expect(Array.isArray(response.body.equipment)).toBe(true)
      expect(response.body.count).toBeGreaterThan(0)
    })

    it("should filter equipment by type", async () => {
      const response = await request(app)
        .get("/api/equipment?type=videobeam")
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(200)

      expect(response.body.equipment.every((e) => e.type === "videobeam")).toBe(true)
    })

    it("should filter equipment by status", async () => {
      const response = await request(app)
        .get("/api/equipment?status=disponible")
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(200)

      expect(response.body.equipment.every((e) => e.status === "disponible")).toBe(true)
    })
  })

  describe("GET /api/equipment/:id", () => {
    it("should get equipment by id", async () => {
      const response = await request(app)
        .get(`/api/equipment/${equipmentId}`)
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("equipment")
      expect(response.body.equipment.id).toBe(equipmentId)
    })

    it("should return 404 for non-existent equipment", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000"
      const response = await request(app)
        .get(`/api/equipment/${fakeId}`)
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(404)

      expect(response.body).toHaveProperty("error")
    })
  })

  describe("PATCH /api/equipment/:id", () => {
    it("should update equipment as technician", async () => {
      const updates = {
        status: "en_mantenimiento",
        location: "Taller de reparación",
      }

      const response = await request(app)
        .patch(`/api/equipment/${equipmentId}`)
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .send(updates)
        .expect(200)

      expect(response.body.equipment.status).toBe("en_mantenimiento")
      expect(response.body.equipment.location).toBe("Taller de reparación")
    })

    it("should not allow non-technicians to update equipment", async () => {
      const response = await request(app)
        .patch(`/api/equipment/${equipmentId}`)
        .set("Authorization", `Bearer ${docenteToken}`)
        .send({ status: "disponible" })
        .expect(403)

      expect(response.body).toHaveProperty("error")
    })
  })
})
