"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var event_1 = require("./event");
var Constants_1 = require("./Constants");
var databaseModule_1 = require("./databaseModule");
var telegramModule_1 = require("./telegramModule");
var database = new databaseModule_1.DatabaseModule(Constants_1.Constants.db_host, Constants_1.Constants.db_user, Constants_1.Constants.db_pass, Constants_1.Constants.db_name);
var telegram = new telegramModule_1.TelegramModule(Constants_1.Constants.telegram_token, Constants_1.Constants.telegram_master_id, database, true);
/* Express */
var port = process.env.PORT || 8080;
var app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));
app.use(event_1.EventRouter.createRouter(database));
app.listen(port, function () {
    console.log("Express server listening on port ".concat(port));
});
