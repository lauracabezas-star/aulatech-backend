const express = require("express")
const { body } = require("express-validator")
const equipmentController = require("../controllers/equipment.controller")
const { authenticate, authorize } = require("../middlewares/auth.middleware")

const router = express.Router()

// Validaciones para crear equipo
const createEquipmentValidation = [
  body("name").trim().notEmpty().withMessage("El nombre es requerido"),
  body("type")
    .isIn(["videobeam", "computador", "tablet", "camara", "microfono", "otro"])
    .withMessage("Tipo de equipo inválido"),
  body("serialNumber").trim().notEmpty().withMessage("El número de serie es requerido"),
  body("location").trim().notEmpty().withMessage("La ubicación es requerida"),
]

/**
 * @route   GET /api/equipment
 * @desc    Listar todos los equipos
 * @access  Private
 */
router.get("/", authenticate, equipmentController.getAllEquipment)

/**
 * @route   GET /api/equipment/:id
 * @desc    Obtener equipo por ID
 * @access  Private
 */
router.get("/:id", authenticate, equipmentController.getEquipmentById)

/**
 * @route   POST /api/equipment
 * @desc    Crear nuevo equipo
 * @access  Private (solo técnicos)
 */
router.post("/", authenticate, authorize("tecnico"), createEquipmentValidation, equipmentController.createEquipment)

/**
 * @route   PATCH /api/equipment/:id
 * @desc    Actualizar equipo
 * @access  Private (solo técnicos)
 */
router.patch("/:id", authenticate, authorize("tecnico"), equipmentController.updateEquipment)

module.exports = router
