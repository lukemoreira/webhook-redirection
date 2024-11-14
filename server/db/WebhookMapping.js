const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Mapping = sequelize.define('Mapping', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  incomingFields: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  outgoingFields: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  formula: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Mapping;
