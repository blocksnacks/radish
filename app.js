require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws');
const radiksServer = require('radiks-server');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mailer = require('./mailer');
const { CENTRAL_COLLECTION, USER_SETTINGS } = require('./constants');

const port = process.env.PORT || 1260;
const mongoDBUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/radiks-server';
console.log(process.env);
console.log(port, mongoDBUrl);

const app = express();
expressWs(app);

radiksServer.setup({ mongoDBUrl })
  .then(radiksController => {
    app.use(bodyParser.json());
    app.use(cors());

    app.use(express.static(path.join(__dirname, 'build')));
    app.get('/', (_req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });

    app.use('/radiks', radiksController);

    app.post('/email/invite-users', (req, res) => {
      const { recipients, creator, groupName } = req.body;
      if (
        !recipients
        || !recipients.length
        || !recipients.every(r => r.blockstackId && r.inviteId)
        || !creator
        || !groupName
      ) {
        return res.status(400).send({ error: 'Missing required body keys' });
      }

      return Promise.all(recipients.map(async ({ blockstackId, inviteId }) => {
        const db = await radiksServer.getDB();
        const centralCollection = db.collection(CENTRAL_COLLECTION);
        const userSettings = await centralCollection.findOne({ _id: `${blockstackId}-${USER_SETTINGS}` });
        if (!userSettings.email) {
          return { status: 'failed', reason: 'noEmailForUser', blockstackId };
        }
        const emailResults = await mailer.inviteUser(
          userSettings.email,
          { blockstackId, inviteId, creator, groupName }
        );
        const status = emailResults[0].statusCode === 202 ? 'success' : 'failed';
        return { status, blockstackId };
      }))
        .then((results) => res.json({ results }))
        .catch((err) => {
          console.error('Error sending emails', err);
          res.sendStatus(500);
        });
    });

    // Handles any requests that don't match the ones above
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });

    app.listen(port, (err) => {
      if (err) throw err;
      console.info(`radiks-server listening on port ${port}`);
    });
  })
  .catch(err => console.error(`Error setting up MongoDB ${err}`));
