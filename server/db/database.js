// server/db/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Create a new Sequelize instance connected to an SQLite database file
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'db', 'webhooks.sqlite'), // Database file path
  logging: false,
  pool: {
    max: 2,
    min: 0,
    acquire: 10000,
    idle: 5000,
  },
});

// Authenticate and set recommended PRAGMAs and foreign keys
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to SQLite has been established successfully.');

    // Enable foreign keys
    await sequelize.query('PRAGMA foreign_keys = ON;');
    console.log('Foreign keys enabled successfully.');

    // Setting recommended PRAGMAs
    await sequelize.query('PRAGMA journal_mode = WAL;');
    await sequelize.query('PRAGMA synchronous = FULL;');

    console.log('Database configured with recommended PRAGMAs.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Gracefully close connection on shutdown
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed gracefully.');
    process.exit(0);
  } catch (error) {
    console.error('Error while closing database connection:', error);
    process.exit(1);
  }
});

module.exports = sequelize;