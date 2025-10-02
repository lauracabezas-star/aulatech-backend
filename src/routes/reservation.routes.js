const express = require("express")
const { body } = require("express-validator")
const reservationController = require("../controllers/reservation.controller")
const { authenticate, authorize } = require("../middlewares/auth.middleware")

const router = express.Router()

// Validaciones para crear reserva
const createReservationValidation = [
  body("equipmentId").isUUID().withMessage("ID de equipo inválido"),
  body("startDate").isISO8601().withMessage("Fecha de inicio inválida"),
  body("endDate").isISO8601().withMessage("Fecha de fin inválida"),
  body("purpose").trim().notEmpty().withMessage("El propósito es requerido"),
  body("classroom").optional().trim(),
]

/**
 * @route   POST /api/reservations
 * @desc    Crear nueva reserva (HU01)
 * @access  Private (docentes y estudiantes)
 */
router.post("/", authenticate, createReservationValidation, reservationController.createReservation)

/**
 * @route   GET /api/reservations/my
 * @desc    Obtener mis reservas (HU05)
 * @access  Private
 */
router.get("/my", authenticate, reservationController.getMyReservations)

/**
 * @route   GET /api/reservations
 * @desc    Obtener todas las reservas
 * @access  Private (solo técnicos)
 */
router.get("/", authenticate, authorize("tecnico"), reservationController.getAllReservations)

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Cancelar reserva (HU04)
 * @access  Private
 */
router.delete("/:id", authenticate, reservationController.cancelReservation)

module.exports = router
