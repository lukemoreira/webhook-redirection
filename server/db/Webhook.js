const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Webhook = sequelize.define('Webhook', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signature: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  signatureHeader: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mappingId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

module.exports = Webhook;
