const app = require("./app")
const { sequelize } = require("./models")
require("dotenv").config()

const PORT = process.env.PORT || 3000

// Sincronizar base de datos y arrancar servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate()
    console.log("Conexión a la base de datos establecida correctamente.")

    // Sincronizar modelos (en desarrollo)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
      console.log("Modelos sincronizados con la base de datos.")
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(` Servidor corriendo en puerto ${PORT}`)
      console.log(` Ambiente: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

startServer()
