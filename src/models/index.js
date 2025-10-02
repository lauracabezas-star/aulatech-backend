const { Sequelize } = require("sequelize")
const config = require("../config/database")

const env = process.env.NODE_ENV || "development"
const dbConfig = config[env]

// Crear instancia de Sequelize
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
})

const db = {
  sequelize,
  Sequelize,
}

db.User = require("./user.model")(sequelize, Sequelize)
db.Equipment = require("./equipment.model")(sequelize, Sequelize)
db.Reservation = require("./reservation.model")(sequelize, Sequelize)
db.Report = require("./report.model")(sequelize, Sequelize)

// Usuario tiene muchas reservas
db.User.hasMany(db.Reservation, {
  foreignKey: "userId",
  as: "reservations",
})
db.Reservation.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
})

// Equipo tiene muchas reservas
db.Equipment.hasMany(db.Reservation, {
  foreignKey: "equipmentId",
  as: "reservations",
})
db.Reservation.belongsTo(db.Equipment, {
  foreignKey: "equipmentId",
  as: "equipment",
})

// Usuario tiene muchos reportes (como reportador)
db.User.hasMany(db.Report, {
  foreignKey: "userId",
  as: "reports",
})
db.Report.belongsTo(db.User, {
  foreignKey: "userId",
  as: "reporter",
})

// Equipo tiene muchos reportes
db.Equipment.hasMany(db.Report, {
  foreignKey: "equipmentId",
  as: "reports",
})
db.Report.belongsTo(db.Equipment, {
  foreignKey: "equipmentId",
  as: "equipment",
})

// Técnico asignado a reportes
db.User.hasMany(db.Report, {
  foreignKey: "assignedToId",
  as: "assignedReports",
})
db.Report.belongsTo(db.User, {
  foreignKey: "assignedToId",
  as: "assignedTo",
})

module.exports = db
