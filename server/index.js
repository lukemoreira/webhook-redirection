// server/index.js

const express = require('express');
const cors = require('cors');  // Import cors middleware
const axios = require('axios');
const crypto = require('crypto');
const sequelize = require('./db/database');
const Webhook = require('./db/Webhook');
require('dotenv').config(); // Import and configure dotenv

const app = express();

// Load environment variables
const PORT = process.env.PORT || 5000;
const DOMAIN_NAME = process.env.DOMAIN_NAME || 'http://localhost';

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(express.json());

// Sync database and create tables
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to SQLite has been established successfully.');
    await sequelize.sync(); // Synchronize all models (create tables if they don't exist)
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Create a new webhook
app.post('/create-webhook', async (req, res) => {
  const { signature, destination, name } = req.body;

  try {
    const newWebhook = await Webhook.create({ signature, destination, name });
    res.status(201).send({
      id: newWebhook.id,
      url: `${DOMAIN_NAME}/webhook-${newWebhook.id}`
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).send('Error creating webhook');
  }
});

// Get all webhooks
app.get('/api/webhooks', async (req, res) => {
  try {
    const webhooks = await Webhook.findAll();
    res.status(200).json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).send('Error fetching webhooks');
  }
});

// Delete a webhook by ID
app.delete('/api/webhooks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCount = await Webhook.destroy({ where: { id } });
    if (deletedCount === 0) {
      return res.status(404).send('Webhook not found');
    }
    res.status(200).send('Webhook deleted');
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).send('Error deleting webhook');
  }
});

// Update a webhook by ID
app.put('/api/webhooks/:id', async (req, res) => {
  const { id } = req.params;
  const { name, signature, destination } = req.body;

  try {
    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      return res.status(404).send('Webhook not found');
    }
    webhook.name = name;
    webhook.signature = signature;
    webhook.destination = destination;

    await webhook.save();
    res.status(200).send('Webhook updated');
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).send('Error updating webhook');
  }
});

// Middleware to verify the signature of incoming requests (reuse as before)
const verifyOpenPhoneSignature = (req, res, next) => {
  try {
    const signatureHeader = req.headers['openphone-signature'];
    if (!signatureHeader) {
      return res.status(400).send('Missing signature');
    }

    const fields = signatureHeader.split(';');
    if (fields.length !== 4) {
      return res.status(400).send('Invalid signature format');
    }

    const [scheme, version, timestamp, providedDigest] = fields;
    if (scheme !== 'hmac' || version !== '1') {
      return res.status(400).send('Unsupported signature scheme or version');
    }

    const signedData = `${timestamp}.${JSON.stringify(req.body)}`;
    const signingKeyBinary = Buffer.from(signingKey, 'base64');

    const computedDigest = crypto
      .createHmac('sha256', signingKeyBinary)
      .update(Buffer.from(signedData, 'utf8'))
      .digest('base64');

    if (providedDigest !== computedDigest) {
      console.log('Signature verification failed');
      return res.status(401).send('Signature verification failed');
    }

    console.log('Signature verification succeeded');
    next();
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).send('Error verifying signature');
  }
};

// Custom endpoint to receive webhooks with a GUID in the URL
app.post('/webhook-:guid', verifyOpenPhoneSignature, async (req, res) => {
  try {
    const { guid } = req.params;
    const openPhoneData = req.body;

    // Retrieve the destination for the webhook from the database
    const webhook = await Webhook.findByPk(guid);
    if (!webhook) {
      return res.status(404).send('Webhook not found');
    }

    if (openPhoneData?.object?.data?.object) {
      const messageData = openPhoneData.object.data.object;

      // Extract fields for Microsoft Teams message
      const from = messageData.from;
      const body = messageData.body;

      // Reformat data for the destination
      const transformedPayload = {
        text: `From: ${from}\n\nMessage: ${body}`
      };

      // Send the transformed data to the webhook's destination
      await axios.post(webhook.destination, transformedPayload);

      res.status(200).send('Webhook processed and sent to destination.');
    } else {
      res.status(400).send('Invalid webhook format');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
