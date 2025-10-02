const { User } = require("../models")
const { generateToken } = require("../utils/jwt")
const { validationResult } = require("express-validator")

/**
 * Registrar nuevo usuario
 */
const register = async (req, res) => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, firstName, lastName, role } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({
        error: "El email ya está registrado",
      })
    }

    // Crear usuario
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || "estudiante",
    })

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: user.toJSON(),
      token,
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({
      error: "Error al registrar usuario",
      details: error.message,
    })
  }
}

/**
 * Iniciar sesión
 */
const login = async (req, res) => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      })
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        error: "Usuario inactivo",
      })
    }

    // Comparar contraseña
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      })
    }

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.json({
      message: "Inicio de sesión exitoso",
      user: user.toJSON(),
      token,
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({
      error: "Error al iniciar sesión",
      details: error.message,
    })
  }
}

/**
 * Obtener perfil del usuario autenticado
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON(),
    })
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    res.status(500).json({
      error: "Error al obtener perfil",
    })
  }
}

module.exports = {
  register,
  login,
  getProfile,
}
