module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define(
    "Reservation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterNow(value) {
            if (new Date(value) < new Date()) {
              throw new Error("La fecha de inicio debe ser futura")
            }
          },
        },
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterStart(value) {
            if (new Date(value) <= new Date(this.startDate)) {
              throw new Error("La fecha de fin debe ser posterior a la fecha de inicio")
            }
          },
        },
      },
      purpose: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "El propósito de la reserva es requerido",
          },
        },
      },
      classroom: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("activa", "completada", "cancelada"),
        defaultValue: "activa",
        allowNull: false,
      },
      cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "reservations",
      timestamps: true,
    },
  )

  return Reservation
}
