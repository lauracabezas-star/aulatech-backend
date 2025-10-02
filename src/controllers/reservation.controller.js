const { Reservation, Equipment, User } = require("../models")
const { validationResult } = require("express-validator")
const { Op } = require("sequelize")

/**
 * Verificar disponibilidad de equipo en un rango de fechas
 */
const checkAvailability = async (equipmentId, startDate, endDate, excludeReservationId = null) => {
  const where = {
    equipmentId,
    status: "activa",
    [Op.or]: [
      {
        startDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      {
        endDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      {
        [Op.and]: [
          {
            startDate: {
              [Op.lte]: startDate,
            },
          },
          {
            endDate: {
              [Op.gte]: endDate,
            },
          },
        ],
      },
    ],
  }

  if (excludeReservationId) {
    where.id = { [Op.ne]: excludeReservationId }
  }

  const conflictingReservations = await Reservation.count({ where })

  return conflictingReservations === 0
}

/**
 * Crear nueva reserva (HU01)
 */
const createReservation = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { equipmentId, startDate, endDate, purpose, classroom } = req.body
    const userId = req.user.id

    // Verificar que el equipo existe y está disponible
    const equipment = await Equipment.findByPk(equipmentId)

    if (!equipment) {
      return res.status(404).json({
        error: "Equipo no encontrado",
      })
    }

    if (equipment.status !== "disponible") {
      return res.status(400).json({
        error: `El equipo no está disponible. Estado actual: ${equipment.status}`,
      })
    }

    // Verificar disponibilidad en el rango de fechas (HU01 - Criterio: no traslape)
    const isAvailable = await checkAvailability(equipmentId, startDate, endDate)

    if (!isAvailable) {
      return res.status(409).json({
        error: "El equipo ya está reservado en el horario solicitado",
      })
    }

    // Crear reserva
    const reservation = await Reservation.create({
      userId,
      equipmentId,
      startDate,
      endDate,
      purpose,
      classroom,
    })

    // Cargar relaciones para la respuesta
    await reservation.reload({
      include: [
        { model: User, as: "user", attributes: ["id", "email", "firstName", "lastName", "role"] },
        { model: Equipment, as: "equipment" },
      ],
    })

    res.status(201).json({
      message: "Reserva creada exitosamente",
      reservation,
    })
  } catch (error) {
    console.error("Error al crear reserva:", error)
    res.status(500).json({
      error: "Error al crear reserva",
      details: error.message,
    })
  }
}

/**
 * Obtener reservas del usuario autenticado (HU05)
 */
const getMyReservations = async (req, res) => {
  try {
    const userId = req.user.id
    const { status } = req.query

    const where = { userId }
    if (status) where.status = status

    const reservations = await Reservation.findAll({
      where,
      include: [{ model: Equipment, as: "equipment" }],
      order: [["startDate", "DESC"]],
    })

    res.json({
      count: reservations.length,
      reservations,
    })
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    res.status(500).json({
      error: "Error al obtener reservas",
      details: error.message,
    })
  }
}

/**
 * Obtener todas las reservas (solo técnicos)
 */
const getAllReservations = async (req, res) => {
  try {
    const { status, equipmentId } = req.query

    const where = {}
    if (status) where.status = status
    if (equipmentId) where.equipmentId = equipmentId

    const reservations = await Reservation.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "email", "firstName", "lastName", "role"] },
        { model: Equipment, as: "equipment" },
      ],
      order: [["startDate", "DESC"]],
    })

    res.json({
      count: reservations.length,
      reservations,
    })
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    res.status(500).json({
      error: "Error al obtener reservas",
      details: error.message,
    })
  }
}

/**
 * Cancelar reserva (HU04)
 */
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const userId = req.user.id

    const reservation = await Reservation.findByPk(id)

    if (!reservation) {
      return res.status(404).json({
        error: "Reserva no encontrada",
      })
    }

    // Verificar que el usuario es dueño de la reserva o es técnico
    if (reservation.userId !== userId && req.user.role !== "tecnico") {
      return res.status(403).json({
        error: "No tiene permisos para cancelar esta reserva",
      })
    }

    // HU04 - Criterio: No permitir cancelar reservas que ya comenzaron
    if (new Date(reservation.startDate) <= new Date()) {
      return res.status(400).json({
        error: "No se puede cancelar una reserva que ya comenzó",
      })
    }

    if (reservation.status === "cancelada") {
      return res.status(400).json({
        error: "La reserva ya está cancelada",
      })
    }

    // Cancelar reserva
    await reservation.update({
      status: "cancelada",
      cancelReason: reason || "Cancelada por el usuario",
    })

    res.json({
      message: "Reserva cancelada exitosamente",
      reservation,
    })
  } catch (error) {
    console.error("Error al cancelar reserva:", error)
    res.status(500).json({
      error: "Error al cancelar reserva",
      details: error.message,
    })
  }
}

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  cancelReservation,
}
