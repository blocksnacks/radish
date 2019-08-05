require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws');
const radiksServer = require('radiks-server');

const port = process.env.PORT || 1260;
const mongoDBUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/radiks-server';

const app = express();
expressWs(app);

radiksServer.setup({ mongoDBUrl })
  .then(radiksController => {
    app.use('/radiks', radiksController);

    app.listen(port, (err) => {
      if (err) throw err;
      console.info(`radiks-sever listening on port ${port}`);
    });
  })
  .catch(err => console.error(`Error setting up MongoDB ${err}`));
