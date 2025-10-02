module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define(
    "Report",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ticketNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      equipmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "equipment",
          key: "id",
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "La descripción del problema es requerida",
          },
        },
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pendiente", "en_proceso", "resuelto", "cerrado"),
        defaultValue: "pendiente",
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM("baja", "media", "alta", "urgente"),
        defaultValue: "media",
        allowNull: false,
      },
      assignedToId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "reports",
      timestamps: true,
      hooks: {
        beforeCreate: async (report) => {
          // Generar número de ticket único
          const timestamp = Date.now()
          const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")
          report.ticketNumber = `TKT-${timestamp}-${random}`
        },
      },
    },
  )

  return Report
}
