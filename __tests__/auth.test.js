const request = require("supertest")
const app = require("../src/app")
const { sequelize, User } = require("../src/models")

// Configurar base de datos de prueba
beforeAll(async () => {
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  await sequelize.close()
})

describe("Auth Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "docente@test.com",
        password: "password123",
        firstName: "Juan",
        lastName: "Pérez",
        role: "docente",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("user")
      expect(response.body).toHaveProperty("token")
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.role).toBe("docente")
      expect(response.body.user).not.toHaveProperty("password")
    })

    it("should not register user with duplicate email", async () => {
      const userData = {
        email: "docente@test.com",
        password: "password123",
        firstName: "María",
        lastName: "García",
        role: "estudiante",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body).toHaveProperty("error")
    })

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "123",
        })
        .expect(400)

      expect(response.body).toHaveProperty("errors")
    })
  })

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const credentials = {
        email: "docente@test.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/login").send(credentials).expect(200)

      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("user")
      expect(response.body).toHaveProperty("token")
      expect(response.body.user.email).toBe(credentials.email)
    })

    it("should not login with invalid credentials", async () => {
      const credentials = {
        email: "docente@test.com",
        password: "wrongpassword",
      }

      const response = await request(app).post("/api/auth/login").send(credentials).expect(401)

      expect(response.body).toHaveProperty("error")
    })

    it("should not login with non-existent user", async () => {
      const credentials = {
        email: "noexiste@test.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/login").send(credentials).expect(401)

      expect(response.body).toHaveProperty("error")
    })
  })

  describe("GET /api/auth/profile", () => {
    let authToken

    beforeAll(async () => {
      // Login para obtener token
      const response = await request(app).post("/api/auth/login").send({
        email: "docente@test.com",
        password: "password123",
      })

      authToken = response.body.token
    })

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("user")
      expect(response.body.user.email).toBe("docente@test.com")
    })

    it("should not get profile without token", async () => {
      const response = await request(app).get("/api/auth/profile").expect(401)

      expect(response.body).toHaveProperty("error")
    })

    it("should not get profile with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401)

      expect(response.body).toHaveProperty("error")
    })
  })
})
