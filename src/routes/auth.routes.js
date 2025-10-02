const express = require("express")
const { body } = require("express-validator")
const authController = require("../controllers/auth.controller")
const { authenticate } = require("../middlewares/auth.middleware")

const router = express.Router()

// Validaciones para registro
const registerValidation = [
  body("email").isEmail().withMessage("Debe proporcionar un email válido").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("firstName").trim().notEmpty().withMessage("El nombre es requerido"),
  body("lastName").trim().notEmpty().withMessage("El apellido es requerido"),
  body("role")
    .optional()
    .isIn(["docente", "estudiante", "tecnico"])
    .withMessage("El rol debe ser: docente, estudiante o tecnico"),
]

// Validaciones para login
const loginValidation = [
  body("email").isEmail().withMessage("Debe proporcionar un email válido").normalizeEmail(),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
]

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post("/register", registerValidation, authController.register)

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post("/login", loginValidation, authController.login)

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get("/profile", authenticate, authController.getProfile)

module.exports = router
