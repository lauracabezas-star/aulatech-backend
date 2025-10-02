const { Equipment } = require("../models")
const { validationResult } = require("express-validator")
const { Op } = require("sequelize")

/**
 * Listar todos los equipos disponibles
 */
const getAllEquipment = async (req, res) => {
  try {
    const { type, status, location } = req.query

    const where = { isActive: true }

    if (type) where.type = type
    if (status) where.status = status
    if (location) where.location = { [Op.iLike]: `%${location}%` }

    const equipment = await Equipment.findAll({
      where,
      order: [["createdAt", "DESC"]],
    })

    res.json({
      count: equipment.length,
      equipment,
    })
  } catch (error) {
    console.error("Error al listar equipos:", error)
    res.status(500).json({
      error: "Error al listar equipos",
      details: error.message,
    })
  }
}

/**
 * Obtener un equipo por ID
 */
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params

    const equipment = await Equipment.findByPk(id)

    if (!equipment) {
      return res.status(404).json({
        error: "Equipo no encontrado",
      })
    }

    res.json({ equipment })
  } catch (error) {
    console.error("Error al obtener equipo:", error)
    res.status(500).json({
      error: "Error al obtener equipo",
      details: error.message,
    })
  }
}

/**
 * Crear nuevo equipo (solo técnicos)
 */
const createEquipment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, type, serialNumber, brand, model, location, description } = req.body

    const equipment = await Equipment.create({
      name,
      type,
      serialNumber,
      brand,
      model,
      location,
      description,
    })

    res.status(201).json({
      message: "Equipo creado exitosamente",
      equipment,
    })
  } catch (error) {
    console.error("Error al crear equipo:", error)
    res.status(500).json({
      error: "Error al crear equipo",
      details: error.message,
    })
  }
}

/**
 * Actualizar equipo (solo técnicos)
 */
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const equipment = await Equipment.findByPk(id)

    if (!equipment) {
      return res.status(404).json({
        error: "Equipo no encontrado",
      })
    }

    await equipment.update(updates)

    res.json({
      message: "Equipo actualizado exitosamente",
      equipment,
    })
  } catch (error) {
    console.error("Error al actualizar equipo:", error)
    res.status(500).json({
      error: "Error al actualizar equipo",
      details: error.message,
    })
  }
}

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
}
