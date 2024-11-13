// server/db/Webhook.js
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// Define the Webhook model with the required columns
const Webhook = sequelize.define('Webhook', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Automatically generate UUID for each new webhook
    primaryKey: true
  },
  signature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  signatureHeader: {
    type: DataTypes.STRING,
    allowNull: true
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Webhook;
