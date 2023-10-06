const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//const events = require('./events');

import { Constants } from './Constants';
import { DatabaseModule } from './databaseModule';
import { TelegramModule } from './telegramModule';
//const DatabaseModule = require('./databaseModule');
//const TelegramModule = require('./telegramModule');

let database: DatabaseModule = new DatabaseModule(Constants.db_host, Constants.db_user, Constants.db_pass, Constants.db_name);
let telegram: TelegramModule = new TelegramModule(Constants.telegram_token, Constants.telegram_master_id, database, false);

/* Express */
const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));

//app.use(events(database));

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
