const request = require("supertest")
const app = require("../src/app")
const { sequelize, User, Equipment, Reservation } = require("../src/models")

let docenteToken, equipmentId

beforeAll(async () => {
  await sequelize.sync({ force: true })

  // Crear usuario docente
  const docenteResponse = await request(app).post("/api/auth/register").send({
    email: "docente@test.com",
    password: "password123",
    firstName: "Juan",
    lastName: "Pérez",
    role: "docente",
  })

  docenteToken = docenteResponse.body.token

  // Crear técnico para crear equipos
  const tecnicoResponse = await request(app).post("/api/auth/register").send({
    email: "tecnico@test.com",
    password: "password123",
    firstName: "Carlos",
    lastName: "Técnico",
    role: "tecnico",
  })

  const tecnicoToken = tecnicoResponse.body.token

  // Crear equipo
  const equipmentResponse = await request(app)
    .post("/api/equipment")
    .set("Authorization", `Bearer ${tecnicoToken}`)
    .send({
      name: "Videobeam Epson",
      type: "videobeam",
      serialNumber: "VB-001",
      brand: "Epson",
      model: "EB-X41",
      location: "Edificio A - Sala 101",
    })

  equipmentId = equipmentResponse.body.equipment.id
})

afterAll(async () => {
  await sequelize.close()
})

describe("Reservation Endpoints", () => {
  describe("POST /api/reservations - HU01", () => {
    it("should create a reservation successfully", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const endTime = new Date(tomorrow)
      endTime.setHours(12, 0, 0, 0)

      const reservationData = {
        equipmentId,
        startDate: tomorrow.toISOString(),
        endDate: endTime.toISOString(),
        purpose: "Clase de Ingeniería de Software",
        classroom: "Sala 101",
      }

      const response = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${docenteToken}`)
        .send(reservationData)
        .expect(201)

      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("reservation")
      expect(response.body.reservation.status).toBe("activa")
      expect(response.body.reservation.equipment.id).toBe(equipmentId)
    })

    it("should not allow overlapping reservations", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(11, 0, 0, 0)

      const endTime = new Date(tomorrow)
      endTime.setHours(13, 0, 0, 0)

      const reservationData = {
        equipmentId,
        startDate: tomorrow.toISOString(),
        endDate: endTime.toISOString(),
        purpose: "Otra clase",
        classroom: "Sala 102",
      }

      const response = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${docenteToken}`)
        .send(reservationData)
        .expect(409)

      expect(response.body).toHaveProperty("error")
    })
  })

  describe("GET /api/reservations/my - HU05", () => {
    it("should get user reservations", async () => {
      const response = await request(app)
        .get("/api/reservations/my")
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("count")
      expect(response.body).toHaveProperty("reservations")
      expect(Array.isArray(response.body.reservations)).toBe(true)
      expect(response.body.count).toBeGreaterThan(0)
    })
  })

  describe("DELETE /api/reservations/:id - HU04", () => {
    it("should cancel a reservation", async () => {
      // Obtener la primera reserva
      const myReservations = await request(app)
        .get("/api/reservations/my")
        .set("Authorization", `Bearer ${docenteToken}`)

      const reservationId = myReservations.body.reservations[0].id

      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${docenteToken}`)
        .send({ reason: "Ya no necesito el equipo" })
        .expect(200)

      expect(response.body).toHaveProperty("message")
      expect(response.body.reservation.status).toBe("cancelada")
    })

    it("should not cancel a reservation that already started", async () => {
      // Crear reserva que ya comenzó
      const past = new Date()
      past.setHours(past.getHours() - 2)

      const endTime = new Date()
      endTime.setHours(endTime.getHours() + 1)

      const reservation = await Reservation.create({
        userId: (await User.findOne({ where: { email: "docente@test.com" } })).id,
        equipmentId,
        startDate: past,
        endDate: endTime,
        purpose: "Test",
        status: "activa",
      })

      const response = await request(app)
        .delete(`/api/reservations/${reservation.id}`)
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(400)

      expect(response.body).toHaveProperty("error")
    })
  })
})
