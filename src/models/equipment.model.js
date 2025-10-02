module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define(
    "Equipment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "El nombre del equipo es requerido",
          },
        },
      },
      type: {
        type: DataTypes.ENUM("videobeam", "computador", "tablet", "camara", "microfono", "otro"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["videobeam", "computador", "tablet", "camara", "microfono", "otro"]],
            msg: "Tipo de equipo inválido",
          },
        },
      },
      serialNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "La ubicación es requerida",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("disponible", "reservado", "en_mantenimiento", "dañado"),
        defaultValue: "disponible",
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "equipment",
      timestamps: true,
    },
  )

  return Equipment
}
