const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

import { EventRouter } from './event';
import { Constants } from './Constants';
import { DatabaseModule } from './databaseModule';
import { TelegramModule } from './telegramModule';

let database: DatabaseModule = new DatabaseModule(Constants.db_host, Constants.db_user, Constants.db_pass, Constants.db_name);
let telegram: TelegramModule = new TelegramModule(Constants.telegram_token, Constants.telegram_master_id, database, true);

/* Express */
const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));

app.use(EventRouter.createRouter(database));

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
