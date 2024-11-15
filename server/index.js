const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const sequelize = require('./db/database');
const { Webhook, Mapping } = require('./db/associations'); // Import models with associations established
require('dotenv').config();

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
    await sequelize.sync({ alter: true }); // Synchronize all models (create tables if they don't exist)
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Create a new webhook
app.post('/api/create-webhook', async (req, res) => {
  const { signature, signatureHeader, destination, name, mappingId } = req.body;

  try {
    const newWebhook = await Webhook.create({ signature, signatureHeader, destination, name, mappingId });
    console.log('Created Webhook:', newWebhook); // Log the created webhook to verify data
    res.status(201).send({
      id: newWebhook.id,
      url: `${DOMAIN_NAME}/webhook-${newWebhook.id}`
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).send('Error creating webhook');
  }
});

// Get a webhook by ID including its mapping
app.get('/api/webhooks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const webhook = await Webhook.findByPk(id, {
      include: {
        model: Mapping,
        as: 'mapping',
      },
    });
    if (!webhook) {
      return res.status(404).send('Webhook not found');
    }
    res.status(200).json(webhook);
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).send('Error fetching webhook');
  }
});

// Get all webhooks
app.get('/api/webhooks', async (req, res) => {
  try {
    const webhooks = await Webhook.findAll({
      include: {
        model: Mapping,
        as: 'mapping', // Make sure to use the alias name defined in associations        
      }
    });
    console.table(webhooks.map((webhook) => ({ id: webhook.id, name: webhook.name, mappingId: webhook.mappingId })));
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
  try {
    const { id } = req.params;
    const { name, signature, signatureHeader, destination, mappingId } = req.body;

    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      return res.status(404).send('Webhook not found');
    }

    webhook.name = name;
    webhook.signature = signature;
    webhook.signatureHeader = signatureHeader;
    webhook.destination = destination;
    webhook.mappingId = mappingId; // Make sure this is updated

    await webhook.save();

    // Log the saved webhook to verify
    console.log('Webhook updated successfully:', webhook);

    res.status(200).send('Webhook updated successfully');
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).send('Error updating webhook');
  }
});

// Create a new mapping
app.post('/api/mappings', async (req, res) => {
  const { name, incomingFields, outgoingFields, formula } = req.body;

  try {
    const newMapping = await Mapping.create({ name, incomingFields, outgoingFields, formula });
    res.status(201).json(newMapping);
  } catch (error) {
    console.error('Error creating mapping:', error);
    res.status(500).send('Error creating mapping');
  }
});

// Get all mappings
app.get('/api/mappings', async (req, res) => {
  try {
    const mappings = await Mapping.findAll();
    res.status(200).json(mappings);
  } catch (error) {
    console.error('Error fetching mappings:', error);
    res.status(500).send('Error fetching mappings');
  }
});

// Get a specific mapping by ID
app.get('/api/mappings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const mapping = await Mapping.findByPk(id);
    if (!mapping) {
      return res.status(404).send('Mapping not found');
    }
    res.status(200).json(mapping);
  } catch (error) {
    console.error('Error fetching mapping:', error);
    res.status(500).send('Error fetching mapping');
  }
});

// Update a mapping by ID
app.put('/api/mappings/:id', async (req, res) => {
  const { id } = req.params;
  const { name, incomingFields, outgoingFields, formula } = req.body;

  try {
    const mapping = await Mapping.findByPk(id);
    if (!mapping) {
      return res.status(404).send('Mapping not found');
    }
    mapping.name = name;
    mapping.incomingFields = incomingFields;
    mapping.outgoingFields = outgoingFields;
    mapping.formula = formula;

    await mapping.save();
    res.status(200).send('Mapping updated');
  } catch (error) {
    console.error('Error updating mapping:', error);
    res.status(500).send('Error updating mapping');
  }
});

// Delete a mapping by ID
app.delete('/api/mappings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await Mapping.destroy({ where: { id } });
    if (deletedCount === 0) {
      return res.status(404).send('Mapping not found');
    }
    res.status(200).send('Mapping deleted');
  } catch (error) {
    console.error('Error deleting mapping:', error);
    res.status(500).send('Error deleting mapping');
  }
});

// Export webhooks to JSON file
app.get('/api/export-webhooks', async (req, res) => {
  try {
    // Fetch all webhooks from the database
    const webhooks = await Webhook.findAll();

    // Convert data to JSON
    const jsonData = JSON.stringify(webhooks, null, 2);

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=webhooks-db-bkp.json');
    res.setHeader('Content-Type', 'application/json');

    // Send the JSON data as a downloadable file
    res.status(200).send(jsonData);
  } catch (error) {
    console.error('Error exporting webhooks:', error);
    res.status(500).send('Error exporting webhooks');
  }
});

// Import webhooks from JSON file
app.post('/api/import-webhooks', async (req, res) => {
  try {
    const webhooksData = req.body; // Assuming JSON is passed in the request body

    if (!Array.isArray(webhooksData)) {
      return res.status(400).send('Invalid data format: Expected an array of webhooks');
    }

    // Loop through each entry and add it to the database
    for (const webhook of webhooksData) {
      await Webhook.create({
        id: webhook.id,  // Keep existing ID if provided
        name: webhook.name,
        signature: webhook.signature,
        signatureHeader: webhook.signatureHeader,
        destination: webhook.destination,
      });
    }

    res.status(200).send('Webhooks imported successfully');
  } catch (error) {
    console.error('Error importing webhooks:', error);
    res.status(500).send('Error importing webhooks');
  }
});

// Middleware to verify the signature of incoming requests (generic)
const verifySignature = async (req, res, next) => {
  try {
    const webhook = await Webhook.findByPk(req.params.guid);
    if (!webhook) {
      return res.status(404).send('Webhook not found');
    }

    const { signature, signatureHeader } = webhook;

    // If signature or signature header is not provided, skip signature verification
    if (!signature || !signatureHeader) {
      return next();
    }

    const signatureHeaderKey = signatureHeader;
    const signatureHeaderValue = req.headers[signatureHeaderKey];

    if (!signatureHeaderValue) {
      return res.status(400).send('Missing signature');
    }

    const fields = signatureHeaderValue.split(';');
    if (fields.length !== 4) {
      return res.status(400).send('Invalid signature format');
    }

    const [scheme, version, timestamp, providedDigest] = fields;
    if (scheme !== 'hmac' || version !== '1') {
      return res.status(400).send('Unsupported signature scheme or version');
    }

    const signedData = `${timestamp}.${JSON.stringify(req.body)}`;
    const signingKeyBinary = Buffer.from(signature, 'base64');

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

// Endpoint to process webhooks based on GUID
app.post('/api/webhook-:guid', verifySignature, async (req, res) => {
  try {
    const { guid } = req.params;
    const incomingData = req.body;

    // Retrieve the webhook and its mapping
    const webhook = await Webhook.findByPk(guid);
    if (!webhook) {
      return res.status(404).send('Webhook not found');
    }

    const mapping = await Mapping.findByPk(webhook.mappingId);
    if (!mapping) {
      return res.status(404).send('Mapping not found for the webhook');
    }
    console.log(mapping);

    // Extract incoming fields and outgoing fields
    const incomingFields = mapping.incomingFields;
    const outgoingFields = mapping.outgoingFields;
    const formula = mapping.formula;

    // Use JSONPath to extract incoming data based on the mapping
    const jsonpath = require('jsonpath'); // You need to install this library
    const extractedData = {};
    for (const key in incomingFields) {
      extractedData[key] = jsonpath.query(incomingData, incomingFields[key])[0];
    }

    // Apply the formula to generate the outgoing payload
    const generatePayload = new Function('incomingData', 'return ' + formula);
    const outgoingPayload = generatePayload(extractedData);

    // Send the outgoing payload to the destination
    await axios.post(webhook.destination, outgoingPayload);

    res.status(200).send('Webhook processed and sent to destination.');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Endpoint to test webhooks based on GUID
app.post('/api/test-webhook/:guid', async (req, res) => {
  try {
    const { guid } = req.params;

    // Retrieve the webhook and its mapping
    const webhook = await Webhook.findByPk(guid);
    if (!webhook) {
      return res.status(404).send('Webhook not found');
    }

    const mapping = await Mapping.findByPk(webhook.mappingId);
    if (!mapping) {
      return res.status(404).send('Mapping not found for the webhook');
    }

    // Generate sample incoming data for testing based on the incoming fields
    let incomingFields;
    try {
      incomingFields = JSON.parse(mapping.incomingFields); // Parse incoming fields as JSON
    } catch (error) {
      console.error('Error parsing incomingFields:', error);
      return res.status(400).send('Invalid JSON format in incomingFields.');
    }

    const incomingData = {};
    for (const key in incomingFields) {
      incomingData[key] = 'test'; // Fill each field with "test"
    }

    // Extract incoming fields and outgoing fields
    let outgoingFields;
    try {
      outgoingFields = JSON.parse(mapping.outgoingFields); // Parse outgoing fields as JSON
    } catch (error) {
      console.error('Error parsing outgoingFields:', error);
      return res.status(400).send('Invalid JSON format in outgoingFields.');
    }

    const formula = mapping.formula; // Directly use the formula as a string

    // Use JSONPath to extract incoming data based on the mapping
    const jsonpath = require('jsonpath'); // Ensure this library is installed
    const extractedData = {};
    try {
      for (const key in incomingFields) {
        extractedData[key] = jsonpath.query(incomingData, incomingFields[key])[0];
      }
    } catch (jsonPathError) {
      console.error('Error parsing JSONPath:', jsonPathError);
      return res.status(400).send('Error parsing JSONPath expression. Please check the mapping configuration.');
    }

    // Apply the formula to generate the outgoing payload
    let outgoingPayload;
    try {
      // Use the Function constructor to create a new function and execute the formula
      const generatePayload = new Function('incomingData', `{
        ${formula}
      }`);
      outgoingPayload = generatePayload(extractedData);
    } catch (formulaError) {
      console.error('Error applying formula:', formulaError);
      return res.status(400).send('Error applying formula. Please check the mapping configuration.');
    }

    // Send the outgoing payload to the destination
    try {
      await axios.post(webhook.destination, outgoingPayload);
    } catch (sendError) {
      console.error('Error sending outgoing payload:', sendError);
      return res.status(500).send('Error sending outgoing payload to the destination.');
    }

    res.status(200).send('Test webhook processed and sent to destination.');
  } catch (error) {
    console.error('Error processing test webhook:', error);
    res.status(500).send('Error processing test webhook');
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
