const request = require("supertest")
const app = require("../src/app")

describe("Health Check Endpoint", () => {
  it("should return OK status", async () => {
    const response = await request(app).get("/api/health").expect(200)

    expect(response.body).toHaveProperty("status", "OK")
    expect(response.body).toHaveProperty("message")
    expect(response.body).toHaveProperty("timestamp")
  })

  it("should return 404 for non-existent routes", async () => {
    const response = await request(app).get("/api/non-existent").expect(404)

    expect(response.body).toHaveProperty("error")
  })
})
