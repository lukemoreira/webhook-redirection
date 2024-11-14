// server/db/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Create a new Sequelize instance connected to an SQLite database file
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'webhooks.sqlite'), // Database file path
  logging: false // Disable logging for cleaner output
});

module.exports = sequelize;
