"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
var TelegramBot = require('node-telegram-bot-api');
var dbDate_1 = require("./dbDate");
var ANNO = 2023;
var TelegramModule = /** @class */ (function () {
    function TelegramModule(token, master_id, database, sendInitialMessage) {
        var _this = this;
        if (sendInitialMessage === void 0) { sendInitialMessage = false; }
        this.master_id = 0;
        this.bot = null;
        this.fsmData = [];
        var component = this;
        this.bot = new TelegramBot(token, { polling: true });
        this.master_id = master_id;
        this.database = database;
        if (sendInitialMessage) {
            this.sendInitialMessage(this.master_id);
        }
        this.bot.on('message', function (msg) { return __awaiter(_this, void 0, void 0, function () {
            var text, _a, _b, _c, doneAnything, queryPath, nextStep_1, message_1, importo_1, importo_2, message, nextStep, inline_keyboard;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log("From " + msg.chat.id + " | " + component.fsmData[msg.chat.id].step + " : " + msg.text);
                        if (!(msg.chat.id == component.master_id)) return [3 /*break*/, 20];
                        text = msg.text.toLowerCase();
                        if (!(text == "start")) return [3 /*break*/, 1];
                        component.sendInitialMessage(msg.chat.id);
                        return [3 /*break*/, 19];
                    case 1:
                        if (!(text == "agg. conto")) return [3 /*break*/, 2];
                        return [3 /*break*/, 19];
                    case 2:
                        if (!(text == "/bilancio" || text == "bilancio")) return [3 /*break*/, 3];
                        component.database.getBilancioPerConto(new dbDate_1.dbDate().addDays(1).toDateString(), function (bilancio) {
                            if (bilancio.status == 'error') {
                                component.bot.sendMessage(msg.chat.id, "Errore nel recupero del bilancio");
                            }
                            else {
                                var msgText = "Bilancio:\n";
                                for (var i = 0; i < bilancio.length; i++) {
                                    msgText += bilancio[i].conto + ": " + bilancio[i].valore + "\n";
                                }
                                component.bot.sendMessage(msg.chat.id, msgText);
                            }
                        });
                        return [3 /*break*/, 19];
                    case 3:
                        if (!(text == "spesa" || text == "guadagno" || text == "trasferimento")) return [3 /*break*/, 10];
                        component.fsmData[msg.chat.id] = {};
                        if (!(text == "spesa")) return [3 /*break*/, 5];
                        component.fsmData[msg.chat.id].step = 1;
                        _a = component.fsmData[msg.chat.id];
                        return [4 /*yield*/, component.bot.sendMessage(msg.chat.id, "🛒 Spesa\nImporto?")];
                    case 4:
                        _a.lastMessage = _d.sent();
                        return [3 /*break*/, 9];
                    case 5:
                        if (!(text == "guadagno")) return [3 /*break*/, 7];
                        component.fsmData[msg.chat.id].step = 2;
                        _b = component.fsmData[msg.chat.id];
                        return [4 /*yield*/, component.bot.sendMessage(msg.chat.id, "🤑 Guadagno\nImporto?")];
                    case 6:
                        _b.lastMessage = _d.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        if (!(text == "trasferimento")) return [3 /*break*/, 9];
                        component.fsmData[msg.chat.id].step = 3;
                        _c = component.fsmData[msg.chat.id];
                        return [4 /*yield*/, component.bot.sendMessage(msg.chat.id, "➡️ Trasferimento\nImporto?")];
                    case 8:
                        _c.lastMessage = _d.sent();
                        _d.label = 9;
                    case 9: return [3 /*break*/, 19];
                    case 10:
                        doneAnything = false;
                        if (!(component.fsmData[msg.chat.id].step == 1 || component.fsmData[msg.chat.id].step == 2)) return [3 /*break*/, 13];
                        queryPath = void 0;
                        if (component.fsmData[msg.chat.id].step == 1) {
                            queryPath = './queries/categorie/uscitaParent.sql';
                            nextStep_1 = 11;
                            message_1 = "🛒 Spesa\n";
                        }
                        else if (component.fsmData[msg.chat.id].step == 2) {
                            queryPath = './queries/categorie/entrataParent.sql';
                            nextStep_1 = 21;
                            message_1 = "🤑 Guadagno\n";
                        }
                        if (!parseInt(msg.text)) return [3 /*break*/, 12];
                        msg.text = msg.text.replace(",", ".");
                        importo_1 = parseFloat(msg.text);
                        return [4 /*yield*/, component.database.executeQueryFromFile(queryPath, {}, function (categorieParent) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var inline_keyboard, i;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                inline_keyboard = [];
                                                for (i = 0; i < categorieParent.length; i++) {
                                                    if (i % 3 == 0) {
                                                        inline_keyboard[i / 3] = [];
                                                    }
                                                    inline_keyboard[Math.floor(i / 3)][Math.floor(i % 3)] = { text: categorieParent[i].nome, callback_data: categorieParent[i].idCategoria };
                                                }
                                                component.fsmData[msg.chat.id].importo = importo_1;
                                                component.fsmData[msg.chat.id].step = nextStep_1;
                                                return [4 /*yield*/, component.bot.editMessageText(message_1 + "Importo: " + importo_1 + "€\nCategoria?", {
                                                        chat_id: msg.chat.id,
                                                        message_id: component.fsmData[msg.chat.id].lastMessage.message_id,
                                                        reply_markup: {
                                                            inline_keyboard: inline_keyboard,
                                                        },
                                                    })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 11:
                        _d.sent();
                        _d.label = 12;
                    case 12:
                        doneAnything = true;
                        return [3 /*break*/, 18];
                    case 13:
                        if (!(component.fsmData[msg.chat.id].step == 3)) return [3 /*break*/, 16];
                        if (!parseInt(msg.text)) return [3 /*break*/, 15];
                        msg.text = msg.text.replace(",", ".");
                        importo_2 = parseFloat(msg.text);
                        return [4 /*yield*/, component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, function (conti) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var inline_keyboard, i;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                inline_keyboard = [];
                                                for (i = 0; i < conti.length; i++) {
                                                    if (i % 3 == 0) {
                                                        inline_keyboard[i / 3] = [];
                                                    }
                                                    inline_keyboard[Math.floor(i / 3)][Math.floor(i % 3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
                                                }
                                                component.fsmData[msg.chat.id].importo = importo_2;
                                                component.fsmData[msg.chat.id].step = 31;
                                                return [4 /*yield*/, component.bot.editMessageText("➡️ Trasferimento\nImporto: " + importo_2 + "€\nConto from?", {
                                                        chat_id: msg.chat.id,
                                                        message_id: component.fsmData[msg.chat.id].lastMessage.message_id,
                                                        reply_markup: {
                                                            inline_keyboard: inline_keyboard,
                                                        },
                                                    })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 14:
                        _d.sent();
                        _d.label = 15;
                    case 15:
                        doneAnything = true;
                        return [3 /*break*/, 18];
                    case 16:
                        if (!(component.fsmData[msg.chat.id].step == 14 || component.fsmData[msg.chat.id].step == 24)) return [3 /*break*/, 18];
                        message = void 0, nextStep = void 0;
                        if (component.fsmData[msg.chat.id].step == 14) {
                            message = "🛒 Spesa\n";
                            nextStep = 14;
                        }
                        else if (component.fsmData[msg.chat.id].step == 24) {
                            message = "🤑 Guadagno\n";
                            nextStep = 24;
                        }
                        component.fsmData[msg.chat.id].nota = msg.text;
                        component.fsmData[msg.chat.id].step = nextStep;
                        inline_keyboard = [];
                        inline_keyboard[0] = [];
                        inline_keyboard[0][0] = { text: "Fatto ", callback_data: "-1" };
                        return [4 /*yield*/, component.bot.editMessageText(message + "Importo: " + component.fsmData[msg.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.chat.id].nomeCategoria + "\nConto: " + component.fsmData[msg.chat.id].nomeConto + "\nNota: " + msg.text + "\nFatto?", {
                                chat_id: msg.chat.id,
                                message_id: component.fsmData[msg.chat.id].lastMessage.message_id,
                                reply_markup: {
                                    inline_keyboard: inline_keyboard,
                                },
                            })];
                    case 17:
                        _d.sent();
                        doneAnything = true;
                        _d.label = 18;
                    case 18:
                        if (!doneAnything)
                            component.sendMessage(msg.chat.id, "Non capisco, mi dispiace!");
                        _d.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        component.sendMessage(msg.chat.id, "Clearly this is not your place to be.");
                        component.sendMessage(component.master_id, "Qualcuno sta cercando di accedere: " + msg.chat.id);
                        _d.label = 21;
                    case 21: return [2 /*return*/];
                }
            });
        }); });
        this.bot.on("polling_error", function (err) { return console.log(err); });
        this.bot.on("callback_query", function (msg) { return __awaiter(_this, void 0, void 0, function () {
            var queryPath, queryPathParent, queryPathChild, nextStep, nextStepWChild, nextStepNoChild, message, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("Bot callback_query: " + JSON.stringify(msg.data));
                        _a = component.fsmData[msg.message.chat.id].step;
                        switch (_a) {
                            case 11: return [3 /*break*/, 1];
                            case 21: return [3 /*break*/, 1];
                            case 12: return [3 /*break*/, 3];
                            case 22: return [3 /*break*/, 3];
                            case 13: return [3 /*break*/, 5];
                            case 23: return [3 /*break*/, 5];
                            case 14: return [3 /*break*/, 7];
                            case 24: return [3 /*break*/, 9];
                            case 31: return [3 /*break*/, 11];
                            case 32: return [3 /*break*/, 13];
                            case 33: return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 17];
                    case 1:
                        if (component.fsmData[msg.message.chat.id].step == 11) {
                            queryPathParent = './queries/categorie/uscitaParent.sql';
                            queryPathChild = './queries/categorie/uscitaChild.sql';
                            nextStepWChild = 12;
                            nextStepNoChild = 13;
                            message = "🛒 Spesa";
                        }
                        else if (component.fsmData[msg.message.chat.id].step == 21) {
                            queryPathParent = './queries/categorie/entrataParent.sql';
                            queryPathChild = './queries/categorie/entrataChild.sql';
                            nextStepWChild = 22;
                            nextStepNoChild = 23;
                            message = "🤑 Guadagno";
                        }
                        return [4 /*yield*/, component.database.executeQueryFromFile(queryPathParent, {}, function (categorieParent) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var nomeParent, i;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                for (i = 0; i < categorieParent.length; i++) {
                                                    if (categorieParent[i].idCategoria == msg.data) {
                                                        nomeParent = categorieParent[i].nome;
                                                        break;
                                                    }
                                                }
                                                return [4 /*yield*/, component.database.executeQueryFromFile(queryPathChild, { "idParent": parseInt(msg.data) }, function (categorieChild) {
                                                        return __awaiter(this, void 0, void 0, function () {
                                                            var inline_keyboard, message, nextStep, i;
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0:
                                                                        inline_keyboard = [];
                                                                        component.fsmData[msg.message.chat.id].idCategoriaParent = parseInt(msg.data);
                                                                        component.fsmData[msg.message.chat.id].nomeCategoria = nomeParent;
                                                                        if (!(categorieChild.length == 0)) return [3 /*break*/, 2];
                                                                        return [4 /*yield*/, component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, function (conti) {
                                                                                return __awaiter(this, void 0, void 0, function () {
                                                                                    var i;
                                                                                    return __generator(this, function (_a) {
                                                                                        switch (_a.label) {
                                                                                            case 0:
                                                                                                for (i = 0; i < conti.length; i++) {
                                                                                                    if (i % 3 == 0) {
                                                                                                        inline_keyboard[i / 3] = [];
                                                                                                    }
                                                                                                    inline_keyboard[Math.floor(i / 3)][Math.floor(i % 3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
                                                                                                }
                                                                                                nextStep = nextStepNoChild;
                                                                                                message += "\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto?";
                                                                                                component.fsmData[msg.message.chat.id].idCategoriaChild = component.fsmData[msg.message.chat.id].idCategoriaParent;
                                                                                                component.fsmData[msg.message.chat.id].step = nextStep;
                                                                                                return [4 /*yield*/, component.bot.editMessageText(message, {
                                                                                                        chat_id: msg.message.chat.id,
                                                                                                        message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                                                                        reply_markup: {
                                                                                                            inline_keyboard: inline_keyboard,
                                                                                                        },
                                                                                                    })];
                                                                                            case 1:
                                                                                                _a.sent();
                                                                                                return [2 /*return*/];
                                                                                        }
                                                                                    });
                                                                                });
                                                                            })];
                                                                    case 1:
                                                                        _a.sent();
                                                                        return [3 /*break*/, 4];
                                                                    case 2:
                                                                        for (i = 0; i < categorieChild.length; i++) {
                                                                            if (i % 3 == 0) {
                                                                                inline_keyboard[i / 3] = [];
                                                                            }
                                                                            inline_keyboard[Math.floor(i / 3)][Math.floor(i % 3)] = { text: categorieChild[i].nome, callback_data: categorieChild[i].idCategoria };
                                                                        }
                                                                        nextStep = nextStepWChild;
                                                                        message += "\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + nomeParent + "/ ?";
                                                                        component.fsmData[msg.message.chat.id].step = nextStep;
                                                                        return [4 /*yield*/, component.bot.editMessageText(message, {
                                                                                chat_id: msg.message.chat.id,
                                                                                message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                                                reply_markup: {
                                                                                    inline_keyboard: inline_keyboard,
                                                                                },
                                                                            })];
                                                                    case 3:
                                                                        _a.sent();
                                                                        _a.label = 4;
                                                                    case 4: return [2 /*return*/];
                                                                }
                                                            });
                                                        });
                                                    })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 3:
                        if (component.fsmData[msg.message.chat.id].step == 12) {
                            queryPath = './queries/categorie/uscitaChild.sql';
                            nextStep = 13;
                            message = "🛒 Spesa\n";
                        }
                        else if (component.fsmData[msg.message.chat.id].step == 22) {
                            queryPath = './queries/categorie/entrataChild.sql';
                            nextStep = 23;
                            message = "🤑 Guadagno\n";
                        }
                        return [4 /*yield*/, component.database.executeQueryFromFile(queryPath, { "idParent": component.fsmData[msg.message.chat.id].idCategoriaParent }, function (categorieChild) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var nomeChild, i;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                for (i = 0; i < categorieChild.length; i++) {
                                                    if (categorieChild[i].idCategoria == msg.data) {
                                                        nomeChild = categorieChild[i].nome;
                                                        break;
                                                    }
                                                }
                                                return [4 /*yield*/, component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, function (conti) {
                                                        return __awaiter(this, void 0, void 0, function () {
                                                            var inline_keyboard, i;
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0:
                                                                        inline_keyboard = [];
                                                                        for (i = 0; i < conti.length; i++) {
                                                                            if (i % 3 == 0) {
                                                                                inline_keyboard[i / 3] = [];
                                                                            }
                                                                            inline_keyboard[Math.floor(i / 3)][Math.floor(i % 3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
                                                                        }
                                                                        component.fsmData[msg.message.chat.id].idCategoriaChild = parseInt(msg.data);
                                                                        component.fsmData[msg.message.chat.id].nomeCategoria += "/" + nomeChild;
                                                                        component.fsmData[msg.message.chat.id].step = nextStep;
                                                                        return [4 /*yield*/, component.bot.editMessageText(message + "Importo: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto?", {
                                                                                chat_id: msg.message.chat.id,
                                                                                message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                                                reply_markup: {
                                                                                    inline_keyboard: inline_keyboard,
                                                                                },
                                                                            })];
                                                                    case 1:
                                                                        _a.sent();
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        });
                                                    })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 5:
                        if (component.fsmData[msg.message.chat.id].step == 13) {
                            nextStep = 14;
                            message = "🛒 Spesa\n";
                        }
                        else if (component.fsmData[msg.message.chat.id].step == 23) {
                            nextStep = 24;
                            message = "🤑 Guadagno\n";
                        }
                        return [4 /*yield*/, component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, function (conti) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var nomeConto, i, inline_keyboard;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                for (i = 0; i < conti.length; i++) {
                                                    if (conti[i].idConto == msg.data) {
                                                        nomeConto = conti[i].nome;
                                                        break;
                                                    }
                                                }
                                                inline_keyboard = [];
                                                inline_keyboard[0] = [];
                                                inline_keyboard[0][0] = { text: "Fatto ", callback_data: "-1" };
                                                component.fsmData[msg.message.chat.id].idConto = parseInt(msg.data);
                                                component.fsmData[msg.message.chat.id].nomeConto = nomeConto;
                                                component.fsmData[msg.message.chat.id].nota = " ";
                                                component.fsmData[msg.message.chat.id].step = nextStep;
                                                return [4 /*yield*/, component.bot.editMessageText(message + "Importo: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto: " + nomeConto + "\nNota?", {
                                                        chat_id: msg.message.chat.id,
                                                        message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                        reply_markup: {
                                                            inline_keyboard: inline_keyboard,
                                                        },
                                                    })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 7: return [4 /*yield*/, component.database.insertTransazioneNow(component.fsmData[msg.message.chat.id].importo, component.fsmData[msg.message.chat.id].idCategoriaChild, component.fsmData[msg.message.chat.id].idConto, null, component.fsmData[msg.message.chat.id].nota, " ", function (result) {
                            return __awaiter(this, void 0, void 0, function () {
                                var message;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            component.fsmData[msg.message.chat.id].step = 0;
                                            message = "🛒 Spesa\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto: " + component.fsmData[msg.message.chat.id].nomeConto + "\nNota: " + component.fsmData[msg.message.chat.id].nota + "\nId: " + result.insertId + "\nSalvato!";
                                            return [4 /*yield*/, component.bot.editMessageText(message, {
                                                    chat_id: msg.message.chat.id,
                                                    message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 9: return [4 /*yield*/, component.database.insertTransazioneNow(component.fsmData[msg.message.chat.id].importo, component.fsmData[msg.message.chat.id].idCategoriaChild, component.fsmData[msg.message.chat.id].idConto, null, component.fsmData[msg.message.chat.id].nota, " ", function (result) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            component.fsmData[msg.message.chat.id].step = 0;
                                            return [4 /*yield*/, component.bot.editMessageText("🤑 Guadagno\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto: " + component.fsmData[msg.message.chat.id].nomeConto + "\nNota: " + component.fsmData[msg.message.chat.id].nota + "\nId: " + result.insertId + "\nSalvato!", {
                                                    chat_id: msg.message.chat.id,
                                                    message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 11: return [4 /*yield*/, component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, function (conti) {
                            return __awaiter(this, void 0, void 0, function () {
                                var nomeConto, i, inline_keyboard, i;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            for (i = 0; i < conti.length; i++) {
                                                if (conti[i].idConto == msg.data) {
                                                    nomeConto = conti[i].nome;
                                                    break;
                                                }
                                            }
                                            inline_keyboard = [];
                                            for (i = 0; i < conti.length; i++) {
                                                if (i % 3 == 0) {
                                                    inline_keyboard[i / 3] = [];
                                                }
                                                inline_keyboard[Math.floor(i / 3)][Math.floor(i % 3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
                                            }
                                            component.fsmData[msg.message.chat.id].idContoFrom = parseInt(msg.data);
                                            component.fsmData[msg.message.chat.id].nomeContoFrom = nomeConto;
                                            component.fsmData[msg.message.chat.id].step = 32;
                                            return [4 /*yield*/, component.bot.editMessageText("➡️ Trasferimento\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nConto from: " + nomeConto + "\nConto to?", {
                                                    chat_id: msg.message.chat.id,
                                                    message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                    reply_markup: {
                                                        inline_keyboard: inline_keyboard,
                                                    },
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 13: return [4 /*yield*/, component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, function (conti) {
                            return __awaiter(this, void 0, void 0, function () {
                                var nomeConto, i, inline_keyboard;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            for (i = 0; i < conti.length; i++) {
                                                if (conti[i].idConto == msg.data) {
                                                    nomeConto = conti[i].nome;
                                                    break;
                                                }
                                            }
                                            inline_keyboard = [];
                                            inline_keyboard[0] = [];
                                            inline_keyboard[0][0] = { text: "Fatto ", callback_data: "-1" };
                                            component.fsmData[msg.message.chat.id].idContoTo = parseInt(msg.data);
                                            component.fsmData[msg.message.chat.id].nomeContoTo = nomeConto;
                                            component.fsmData[msg.message.chat.id].nota = " ";
                                            component.fsmData[msg.message.chat.id].step = 33;
                                            return [4 /*yield*/, component.bot.editMessageText("➡️ Trasferimento\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nConto from: " + component.fsmData[msg.message.chat.id].nomeContoFrom + "\nConto to: " + nomeConto + "\nDescrizione?", {
                                                    chat_id: msg.message.chat.id,
                                                    message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                    reply_markup: {
                                                        inline_keyboard: inline_keyboard,
                                                    },
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 15: return [4 /*yield*/, component.database.insertTransazioneNow(component.fsmData[msg.message.chat.id].importo, null, component.fsmData[msg.message.chat.id].idContoFrom, component.fsmData[msg.message.chat.id].idContoTo, component.fsmData[msg.message.chat.id].nota, " ", function (result) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            component.fsmData[msg.message.chat.id].step = 0;
                                            return [4 /*yield*/, component.bot.editMessageText("➡️ Trasferimento\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nConto from: " + component.fsmData[msg.message.chat.id].nomeContoFrom + "\nConto to: " + component.fsmData[msg.message.chat.id].nomeContoTo + "\nDescrizione:\nId: " + result.insertId + "\nSalvato!", {
                                                    chat_id: msg.message.chat.id,
                                                    message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 17: return [2 /*return*/];
                }
            });
        }); });
    }
    TelegramModule.prototype.sendInitialMessage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.fsmData[id] = { step: 0 };
                        return [4 /*yield*/, this.bot.sendMessage(id, "Benvenuto!", {
                                reply_markup: JSON.stringify({
                                    keyboard: [
                                        ['Spesa', 'Guadagno', 'Trasferimento'],
                                        ['Agg. Conto'],
                                        ['Bilancio']
                                    ]
                                })
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegramModule.prototype.sendMessage = function (id, message, opts) {
        if (opts === void 0) { opts = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(opts == null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.bot.sendMessage(id, message)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.bot.sendMessage(id, message, opts)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return TelegramModule;
}());
exports.TelegramModule = TelegramModule;
