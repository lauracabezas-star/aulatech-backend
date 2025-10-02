const { verifyToken } = require("../utils/jwt")
const { User } = require("../models")

/**
 * Middleware para verificar autenticación
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No se proporcionó token de autenticación",
      })
    }

    const token = authHeader.substring(7) // Remover "Bearer "

    // Verificar token
    const decoded = verifyToken(token)

    // Buscar usuario
    const user = await User.findByPk(decoded.userId)

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "Usuario no encontrado o inactivo",
      })
    }

    // Agregar usuario al request
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
    })
  }
}

/**
 * Middleware para verificar roles específicos
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autenticado",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "No tiene permisos para acceder a este recurso",
      })
    }

    next()
  }
}

module.exports = {
  authenticate,
  authorize,
}
