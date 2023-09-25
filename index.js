const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const events = require('./events');
const Constants = require('./Constants');

const TelegramModule = require('./telegramModule');
const DatabaseModule = require('./databaseModule');

let database = new DatabaseModule(Constants.db_host, Constants.db_user, Constants.db_pass, Constants.db_name);
let telegram = new TelegramModule(Constants.telegram_token, Constants.telegram_master_id, database, false);

/* Express */
const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));

app.use(events(database));

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
