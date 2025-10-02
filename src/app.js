const express = require("express")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Middlewares globales
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AulaTech API funcionando correctamente",
    timestamp: new Date().toISOString(),
  })
})

app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/equipment", require("./routes/equipment.routes"))
app.use("/api/reservations", require("./routes/reservation.routes"))
app.use("/api/reports", require("./routes/report.routes"))

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.path,
  })
})

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

module.exports = app
