const request = require("supertest")
const app = require("../src/app")
const { sequelize } = require("../src/models")

describe("Integration Tests - Full User Flow", () => {
  let docenteToken, estudianteToken, tecnicoToken
  let equipmentId, reservationId, reportId

  beforeAll(async () => {
    await sequelize.sync({ force: true })
  })

  afterAll(async () => {
    await sequelize.close()
  })

  describe("Complete User Journey", () => {
    it("Step 1: Register users with different roles", async () => {
      // Registrar docente
      const docenteRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "docente@aulatech.com",
          password: "password123",
          firstName: "Juan",
          lastName: "Pérez",
          role: "docente",
        })
        .expect(201)

      docenteToken = docenteRes.body.token
      expect(docenteRes.body.user.role).toBe("docente")

      // Registrar estudiante
      const estudianteRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "estudiante@aulatech.com",
          password: "password123",
          firstName: "María",
          lastName: "García",
          role: "estudiante",
        })
        .expect(201)

      estudianteToken = estudianteRes.body.token
      expect(estudianteRes.body.user.role).toBe("estudiante")

      // Registrar técnico
      const tecnicoRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "tecnico@aulatech.com",
          password: "password123",
          firstName: "Carlos",
          lastName: "Técnico",
          role: "tecnico",
        })
        .expect(201)

      tecnicoToken = tecnicoRes.body.token
      expect(tecnicoRes.body.user.role).toBe("tecnico")
    })

    it("Step 2: Technician creates equipment", async () => {
      const equipmentRes = await request(app)
        .post("/api/equipment")
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .send({
          name: "Videobeam Sony",
          type: "videobeam",
          serialNumber: "VB-SONY-001",
          brand: "Sony",
          model: "VPL-EX455",
          location: "Edificio Principal - Auditorio",
        })
        .expect(201)

      equipmentId = equipmentRes.body.equipment.id
      expect(equipmentRes.body.equipment.status).toBe("disponible")
    })

    it("Step 3: Teacher checks available equipment", async () => {
      const response = await request(app)
        .get("/api/equipment?status=disponible")
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(200)

      expect(response.body.count).toBeGreaterThan(0)
      expect(response.body.equipment.some((e) => e.id === equipmentId)).toBe(true)
    })

    it("Step 4: Teacher creates a reservation (HU01)", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0)

      const endTime = new Date(tomorrow)
      endTime.setHours(16, 0, 0, 0)

      const reservationRes = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${docenteToken}`)
        .send({
          equipmentId,
          startDate: tomorrow.toISOString(),
          endDate: endTime.toISOString(),
          purpose: "Clase de Ingeniería de Software 2",
          classroom: "Auditorio Principal",
        })
        .expect(201)

      reservationId = reservationRes.body.reservation.id
      expect(reservationRes.body.reservation.status).toBe("activa")
    })

    it("Step 5: Teacher views their reservation history (HU05)", async () => {
      const response = await request(app)
        .get("/api/reservations/my")
        .set("Authorization", `Bearer ${docenteToken}`)
        .expect(200)

      expect(response.body.count).toBe(1)
      expect(response.body.reservations[0].id).toBe(reservationId)
    })

    it("Step 6: Student reports equipment failure (HU02)", async () => {
      const reportRes = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${estudianteToken}`)
        .send({
          equipmentId,
          description: "El videobeam no proyecta imagen, solo muestra pantalla azul",
          priority: "alta",
        })
        .expect(201)

      reportId = reportRes.body.report.id
      expect(reportRes.body.report.status).toBe("pendiente")
      expect(reportRes.body.report.ticketNumber).toMatch(/^TKT-/)
    })

    it("Step 7: Technician views all reports (HU06)", async () => {
      const response = await request(app).get("/api/reports").set("Authorization", `Bearer ${tecnicoToken}`).expect(200)

      expect(response.body.count).toBeGreaterThan(0)
      expect(response.body.reports.some((r) => r.id === reportId)).toBe(true)
    })

    it("Step 8: Technician updates report to in progress (HU06)", async () => {
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

    it("Step 9: Technician resolves the report (HU06)", async () => {
      const response = await request(app)
        .patch(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .send({
          status: "resuelto",
          resolution: "Se reemplazó el cable HDMI defectuoso",
        })
        .expect(200)

      expect(response.body.report.status).toBe("resuelto")
      expect(response.body.report.resolvedAt).toBeTruthy()
    })

    it("Step 10: Student checks their report status", async () => {
      const response = await request(app)
        .get("/api/reports/my")
        .set("Authorization", `Bearer ${estudianteToken}`)
        .expect(200)

      const report = response.body.reports.find((r) => r.id === reportId)
      expect(report.status).toBe("resuelto")
    })

    it("Step 11: Teacher cancels reservation (HU04)", async () => {
      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${docenteToken}`)
        .send({
          reason: "Clase cancelada por motivos de salud",
        })
        .expect(200)

      expect(response.body.reservation.status).toBe("cancelada")
    })

    it("Step 12: Technician views report statistics", async () => {
      const response = await request(app)
        .get("/api/reports/stats")
        .set("Authorization", `Bearer ${tecnicoToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("pending")
      expect(response.body).toHaveProperty("resolved")
      expect(response.body.total).toBeGreaterThan(0)
    })
  })
})
