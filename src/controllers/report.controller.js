const { Report, Equipment, User, sequelize } = require("../models")
const { validationResult } = require("express-validator")
const { Op } = require("sequelize")

/**
 * Crear nuevo reporte de falla (HU02)
 */
const createReport = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { equipmentId, description, photoUrl, priority } = req.body
    const userId = req.user.id

    // Verificar que el equipo existe
    const equipment = await Equipment.findByPk(equipmentId)

    if (!equipment) {
      return res.status(404).json({
        error: "Equipo no encontrado",
      })
    }

    // Crear reporte (HU02 - Generar ticket único con estado "pendiente")
    const report = await Report.create({
      userId,
      equipmentId,
      description,
      photoUrl,
      priority: priority || "media",
    })

    // Actualizar estado del equipo si es necesario
    if (priority === "urgente" || priority === "alta") {
      await equipment.update({ status: "en_mantenimiento" })
    }

    // Cargar relaciones para la respuesta
    await report.reload({
      include: [
        { model: User, as: "reporter", attributes: ["id", "email", "firstName", "lastName", "role"] },
        { model: Equipment, as: "equipment" },
      ],
    })

    res.status(201).json({
      message: "Reporte creado exitosamente",
      report,
    })
  } catch (error) {
    console.error("Error al crear reporte:", error)
    res.status(500).json({
      error: "Error al crear reporte",
      details: error.message,
    })
  }
}

/**
 * Obtener todos los reportes (HU06 - Panel de técnicos)
 */
const getAllReports = async (req, res) => {
  try {
    const { status, priority, equipmentId } = req.query

    const where = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (equipmentId) where.equipmentId = equipmentId

    // HU06 - Ordenar por fecha y urgencia
    const reports = await Report.findAll({
      where,
      include: [
        { model: User, as: "reporter", attributes: ["id", "email", "firstName", "lastName", "role"] },
        { model: Equipment, as: "equipment" },
        { model: User, as: "assignedTo", attributes: ["id", "email", "firstName", "lastName"], required: false },
      ],
      order: [
        ["priority", "DESC"], // Urgente primero
        ["createdAt", "ASC"], // Más antiguos primero
      ],
    })

    res.json({
      count: reports.length,
      reports,
    })
  } catch (error) {
    console.error("Error al obtener reportes:", error)
    res.status(500).json({
      error: "Error al obtener reportes",
      details: error.message,
    })
  }
}

/**
 * Obtener reportes del usuario autenticado
 */
const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id
    const { status } = req.query

    const where = { userId }
    if (status) where.status = status

    const reports = await Report.findAll({
      where,
      include: [
        { model: Equipment, as: "equipment" },
        { model: User, as: "assignedTo", attributes: ["id", "email", "firstName", "lastName"], required: false },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.json({
      count: reports.length,
      reports,
    })
  } catch (error) {
    console.error("Error al obtener reportes:", error)
    res.status(500).json({
      error: "Error al obtener reportes",
      details: error.message,
    })
  }
}

/**
 * Obtener un reporte por ID
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params

    const report = await Report.findByPk(id, {
      include: [
        { model: User, as: "reporter", attributes: ["id", "email", "firstName", "lastName", "role"] },
        { model: Equipment, as: "equipment" },
        { model: User, as: "assignedTo", attributes: ["id", "email", "firstName", "lastName"], required: false },
      ],
    })

    if (!report) {
      return res.status(404).json({
        error: "Reporte no encontrado",
      })
    }

    res.json({ report })
  } catch (error) {
    console.error("Error al obtener reporte:", error)
    res.status(500).json({
      error: "Error al obtener reporte",
      details: error.message,
    })
  }
}

/**
 * Actualizar estado de reporte (HU06 - Técnicos)
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, resolution, assignedToId } = req.body
    const technicianId = req.user.id

    const report = await Report.findByPk(id)

    if (!report) {
      return res.status(404).json({
        error: "Reporte no encontrado",
      })
    }

    const updates = {}

    // Actualizar estado
    if (status) {
      updates.status = status

      // Si se marca como resuelto, guardar fecha
      if (status === "resuelto" || status === "cerrado") {
        updates.resolvedAt = new Date()
        updates.resolution = resolution || "Problema resuelto"

        // Actualizar estado del equipo
        const equipment = await Equipment.findByPk(report.equipmentId)
        if (equipment) {
          await equipment.update({ status: "disponible" })
        }
      }

      // Si se marca como en proceso, asignar técnico
      if (status === "en_proceso" && !report.assignedToId) {
        updates.assignedToId = assignedToId || technicianId
      }
    }

    // Actualizar resolución
    if (resolution) {
      updates.resolution = resolution
    }

    // Asignar técnico
    if (assignedToId) {
      updates.assignedToId = assignedToId
    }

    await report.update(updates)

    // Recargar con relaciones
    await report.reload({
      include: [
        { model: User, as: "reporter", attributes: ["id", "email", "firstName", "lastName", "role"] },
        { model: Equipment, as: "equipment" },
        { model: User, as: "assignedTo", attributes: ["id", "email", "firstName", "lastName"], required: false },
      ],
    })

    res.json({
      message: "Reporte actualizado exitosamente",
      report,
    })
  } catch (error) {
    console.error("Error al actualizar reporte:", error)
    res.status(500).json({
      error: "Error al actualizar reporte",
      details: error.message,
    })
  }
}

/**
 * Obtener estadísticas de reportes (Dashboard técnicos)
 */
const getReportStats = async (req, res) => {
  try {
    const totalReports = await Report.count()
    const pendingReports = await Report.count({ where: { status: "pendiente" } })
    const inProgressReports = await Report.count({ where: { status: "en_proceso" } })
    const resolvedReports = await Report.count({ where: { status: "resuelto" } })

    const reportsByPriority = await Report.findAll({
      attributes: ["priority", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["priority"],
    })

    res.json({
      total: totalReports,
      pending: pendingReports,
      inProgress: inProgressReports,
      resolved: resolvedReports,
      byPriority: reportsByPriority,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    res.status(500).json({
      error: "Error al obtener estadísticas",
      details: error.message,
    })
  }
}

module.exports = {
  createReport,
  getAllReports,
  getMyReports,
  getReportById,
  updateReportStatus,
  getReportStats,
}
