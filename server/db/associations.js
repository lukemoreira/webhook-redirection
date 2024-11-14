// server/db/associations.js

const Webhook = require('./Webhook');
const Mapping = require('./WebhookMapping');

// Establish associations
Webhook.belongsTo(Mapping, { foreignKey: 'mappingId', as: 'mapping' });
Mapping.hasMany(Webhook, { foreignKey: 'mappingId', as: 'webhooks' });

module.exports = { Webhook, Mapping };
