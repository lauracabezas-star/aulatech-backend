const express = require("express")
const { body } = require("express-validator")
const reportController = require("../controllers/report.controller")
const { authenticate, authorize } = require("../middlewares/auth.middleware")

const router = express.Router()

// Validaciones para crear reporte
const createReportValidation = [
  body("equipmentId").isUUID().withMessage("ID de equipo inválido"),
  body("description").trim().notEmpty().withMessage("La descripción es requerida"),
  body("photoUrl").optional().isURL().withMessage("URL de foto inválida"),
  body("priority").optional().isIn(["baja", "media", "alta", "urgente"]).withMessage("Prioridad inválida"),
]

// Validaciones para actualizar estado
const updateStatusValidation = [
  body("status").optional().isIn(["pendiente", "en_proceso", "resuelto", "cerrado"]).withMessage("Estado inválido"),
  body("resolution").optional().trim(),
  body("assignedToId").optional().isUUID().withMessage("ID de técnico inválido"),
]

/**
 * @route   POST /api/reports
 * @desc    Crear nuevo reporte de falla (HU02)
 * @access  Private
 */
router.post("/", authenticate, createReportValidation, reportController.createReport)

/**
 * @route   GET /api/reports
 * @desc    Obtener todos los reportes (HU06 - Técnicos)
 * @access  Private (solo técnicos)
 */
router.get("/", authenticate, authorize("tecnico"), reportController.getAllReports)

/**
 * @route   GET /api/reports/my
 * @desc    Obtener mis reportes
 * @access  Private
 */
router.get("/my", authenticate, reportController.getMyReports)

/**
 * @route   GET /api/reports/stats
 * @desc    Obtener estadísticas de reportes
 * @access  Private (solo técnicos)
 */
router.get("/stats", authenticate, authorize("tecnico"), reportController.getReportStats)

/**
 * @route   GET /api/reports/:id
 * @desc    Obtener reporte por ID
 * @access  Private
 */
router.get("/:id", authenticate, reportController.getReportById)

/**
 * @route   PATCH /api/reports/:id
 * @desc    Actualizar estado de reporte (HU06)
 * @access  Private (solo técnicos)
 */
router.patch("/:id", authenticate, authorize("tecnico"), updateStatusValidation, reportController.updateReportStatus)

module.exports = router
