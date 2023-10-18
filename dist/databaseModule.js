"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
var mysql = require('mysql2');
var fs = require('fs');
var dbDate_1 = require("./dbDate");
var MSTOGG = 1000 * 60 * 60 * 24;
var DatabaseModule = /** @class */ (function () {
    function DatabaseModule(db_host, db_user, db_pass, db_name) {
        this.is_connected = false;
        this.db = mysql.createConnection({
            host: db_host,
            user: db_user,
            password: db_pass,
            database: db_name
        });
        var component = this;
        this.db.connect(function (err) {
            if (err)
                throw err;
            component.is_connected = true;
            console.log("DB: Connected!");
        });
        this.db.connect();
    }
    Object.defineProperty(DatabaseModule.prototype, "isConnected", {
        get: function () {
            return this.is_connected;
        },
        enumerable: false,
        configurable: true
    });
    DatabaseModule.prototype.executeQuery = function (query, callback) {
        if (!this.is_connected) {
            console.log("DB: Not connected!");
            return;
        }
        //console.log(query);
        this.db.query(query, function (err, result) {
            if (err)
                throw err;
            callback(result);
        });
    };
    DatabaseModule.prototype.executeQueryFromFile = function (queryFilePath, dataImport, callback) {
        var _this = this;
        var possibleTags = ["idParent", "dateTimeStart", "dateTimeEnd", "anno"];
        //Leggi file
        fs.readFile(queryFilePath, 'utf8', function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
            for (var i = 0; i < possibleTags.length; i++) {
                if (dataImport[possibleTags[i]] != null) {
                    data = data.replaceAll("${" + possibleTags[i] + "}", dataImport[possibleTags[i]]);
                }
            }
            //Esegui query
            _this.executeQuery(data, function (result) {
                callback(result);
            });
        });
    };
    // Bilancio per ogni conto fino al end (data)
    DatabaseModule.prototype.getBilancioPerConto = function (end, callback) {
        var component = this;
        component.executeQueryFromFile('./queries/misc/contiAndGruppo.sql', {}, function (conti) {
            component.executeQueryFromFile('./queries/misc/uscitePerContoToDate.sql', { "dateTimeEnd": end }, function (uscite) {
                component.executeQueryFromFile('./queries/misc/entratePerContoToDate.sql', { "dateTimeEnd": end }, function (entrate) {
                    component.executeQueryFromFile('./queries/transazioni/trasferimentiUscitaPerContoToDate.sql', { "dateTimeEnd": end }, function (transazioniUscita) {
                        component.executeQueryFromFile('./queries/transazioni/trasferimentiEntrataPerContoToDate.sql', { "dateTimeEnd": end }, function (transazioniEntrata) {
                            var totale = 0;
                            for (var i = 0; i < conti.length; i++) {
                                //console.log(conti[i]);
                                conti[i].valore = conti[i].valoreIniziale;
                                for (var j = 0; j < uscite.length; j++) {
                                    if (conti[i].idConto == uscite[j].idContoFrom) {
                                        //console.log(uscite[j]);
                                        conti[i].valore -= uscite[j].uscite;
                                    }
                                }
                                for (var j = 0; j < entrate.length; j++) {
                                    if (conti[i].idConto == entrate[j].idContoFrom) {
                                        //console.log(entrate[j]);
                                        conti[i].valore += entrate[j].entrate;
                                    }
                                }
                                for (var j = 0; j < transazioniEntrata.length; j++) {
                                    if (conti[i].idConto == transazioniEntrata[j].idContoTo) {
                                        //console.log(transazioni[j]);
                                        conti[i].valore += transazioniEntrata[j].transazioniEntrata;
                                    }
                                }
                                for (var j = 0; j < transazioniUscita.length; j++) {
                                    if (conti[i].idConto == transazioniUscita[j].idContoFrom) {
                                        //console.log(transazioni[j]);
                                        conti[i].valore -= transazioniUscita[j].transazioniUscita;
                                    }
                                }
                                conti[i].valore = Math.round(conti[i].valore * 100) / 100;
                                totale += conti[i].valore;
                            }
                            totale = Math.round(totale * 100) / 100;
                            conti.push({ idConto: -1, conto: 'Totale', gruppoConto: '', valore: totale });
                            callback(conti);
                        });
                    });
                });
            });
        });
    };
    // Bilancio per l'anno diviso per conto e giorno
    DatabaseModule.prototype.getBilancioPerContoAnnuoPerGiorno = function (anno, callback) {
        var component = this;
        var beginYear = new dbDate_1.dbDate(anno.toString() + '-01-01');
        var endYear = new dbDate_1.dbDate(anno.toString() + '-12-31');
        var endLastYear = new dbDate_1.dbDate((anno - 1).toString() + '-12-31');
        var dayToCount = (endYear.toMilliseconds() - beginYear.toMilliseconds()) / MSTOGG;
        component.getBilancioPerConto(endLastYear.toDateString(), function (conti) {
            conti[conti.length - 1].valore = 0;
            for (var i = 0; i < conti.length; i++) {
                conti[i].data = {};
                for (var j = 0; j < dayToCount; j++) {
                    var tmp = beginYear.addDays(j);
                    conti[i].data[tmp.toDateString()] = ([tmp.toMilliseconds(), Math.round(conti[i].valore * 100) / 100]);
                }
            }
            component.executeQueryFromFile('./queries/misc/transazioniCategorieFromToDate.sql', { "dateTimeStart": beginYear.toDateString(), "dateTimeEnd": endYear.toDateString() }, function (transazioni) {
                component.executeQueryFromFile('./queries/transazioni/trasferimentiFromToDate.sql', { "dateTimeStart": beginYear.toDateString(), "dateTimeEnd": endYear.toDateString() }, function (trasferimenti) {
                    for (var i = 0; i < trasferimenti.length; i++) {
                        transazioni.push(trasferimenti[i]);
                    }
                    for (var i = 0; i < transazioni.length; i++) {
                        if (transazioni[i].custom == true) {
                            transazioni[i].dateTime = transazioni[i].dateTime;
                        }
                        else {
                            transazioni[i].dateTime = new dbDate_1.dbDate(transazioni[i].dateTime);
                            transazioni[i].dateTime = transazioni[i].dateTime.toDateString();
                        }
                    }
                    for (var i = 0; i < transazioni.length - 1; i++) {
                        for (var j = i + 1; j < transazioni.length; j++) {
                            if (transazioni[i].dateTime > transazioni[j].dateTime) {
                                var tmp = transazioni[i];
                                transazioni[i] = transazioni[j];
                                transazioni[j] = tmp;
                            }
                        }
                    }
                    for (var i = 0; i < transazioni.length; i++) {
                        var index_contoFrom = -1;
                        var index_contoTo = -1;
                        //console.log(transazioni[i]);
                        if (transazioni[i].idCategoria == null) {
                            //console.log("Trasferimento");
                            // Trasferimento
                            for (var j = 0; j < conti.length; j++) {
                                if (conti[j].idConto == transazioni[i].idContoFrom) {
                                    conti[j].valore -= transazioni[i].importo;
                                    index_contoFrom = j;
                                }
                                else if (conti[j].idConto == transazioni[i].idContoTo) {
                                    conti[j].valore += transazioni[i].importo;
                                    index_contoTo = j;
                                }
                            }
                            //console.log("valore from: " + conti[index_contoFrom].valore);
                            //console.log("valore to: " + conti[index_contoTo].valore);
                        }
                        else {
                            //console.log("E/U");
                            for (var j = 0; j < conti.length; j++) {
                                if (conti[j].idConto == transazioni[i].idContoFrom) {
                                    index_contoFrom = j;
                                    if (transazioni[i].isUscita == 1) { //Uscita
                                        conti[j].valore -= transazioni[i].importo;
                                    }
                                    else if (transazioni[i].isEntrata == 1) { //Entrata
                                        conti[j].valore += transazioni[i].importo;
                                    }
                                }
                            }
                            //console.log("valore: " + conti[index_contoFrom].valore);
                        }
                        //console.log("index_contoFrom: " + index_contoFrom);
                        var tmp_date = new dbDate_1.dbDate(transazioni[i].dateTime);
                        var index_day = (tmp_date.toMilliseconds() - beginYear.toMilliseconds()) / MSTOGG;
                        for (var j = index_day; j < dayToCount; j++) {
                            if (index_contoFrom != -1) {
                                conti[index_contoFrom].data[tmp_date.toDateString()] = [tmp_date.toMilliseconds(), Math.round(conti[index_contoFrom].valore * 100) / 100];
                            }
                            if (index_contoTo != -1) {
                                conti[index_contoTo].data[tmp_date.toDateString()] = [tmp_date.toMilliseconds(), Math.round(conti[index_contoTo].valore * 100) / 100];
                            }
                            tmp_date = tmp_date.addDays(1);
                        }
                        //console.log("index_contoTo: " + index_contoTo);
                    }
                    //Set totale
                    for (var i = 0; i < conti.length - 1; i++) {
                        for (var j = 0; j < dayToCount; j++) {
                            conti[conti.length - 1].data[beginYear.addDays(j).toDateString()][1] += conti[i].data[beginYear.addDays(j).toDateString()][1];
                        }
                    }
                    for (var i = 0; i < dayToCount; i++) {
                        conti[conti.length - 1].data[beginYear.addDays(i).toDateString()][1] = Math.round(conti[conti.length - 1].data[beginYear.addDays(i).toDateString()][1] * 100) / 100;
                    }
                    callback(conti);
                });
            });
        });
    };
    // Bilancio per l'anno diviso per conto e giorno con una stima del futuro dai ricorrenti
    // @todo non funziona, solo la prima ricorrenza funziona, le altre rompono tutto e il totale non è aggiornato
    DatabaseModule.prototype.getBilancioPerContoAnnuoPerGiornoConFuturo = function (anno, callback) {
        var component = this;
        var beginYear = new dbDate_1.dbDate(anno.toString() + '-01-01');
        var endYear = new dbDate_1.dbDate(anno.toString() + '-12-31');
        var dayToCount = (endYear.toMilliseconds() - beginYear.toMilliseconds()) / MSTOGG;
        component.getBilancioPerContoAnnuoPerGiorno(anno, function (conti) {
            component.executeQueryFromFile('./queries/ricorrenti/ricorrentiCategorie.sql', {}, function (ricorrenti) {
                for (var i = 0; i < ricorrenti.length; i++) {
                    //console.log(ricorrenti[i]);
                    var index_conto = -1;
                    for (var j = 0; j < conti.length && index_conto == -1; j++) {
                        if (conti[j].idConto == ricorrenti[i].idContoFrom) {
                            index_conto = j;
                        }
                    }
                    if (index_conto != -1) {
                        var now = new dbDate_1.dbDate(beginYear.toDateString());
                        while (now.toDateString() < new dbDate_1.dbDate().toDateString()) {
                            now = now.addMonth(1);
                        }
                        while (now.toDateString() < endYear.toDateString()) {
                            var delta = 0;
                            if (ricorrenti[i].isEntrata == 1) {
                                delta = ricorrenti[i].importo;
                            }
                            else if (ricorrenti[i].isUscita == 1) {
                                delta = ricorrenti[i].importo * -1;
                            }
                            var cycleDate = new dbDate_1.dbDate(now.toDateString());
                            while (cycleDate.toDateString() < endYear.toDateString()) {
                                conti[index_conto].data[cycleDate.toDateString()][1] = Math.round((conti[index_conto].data[cycleDate.toDateString()][1] + delta) * 100) / 100;
                                conti[conti.length - 1].data[cycleDate.toDateString()][1] = Math.round((conti[conti.length - 1].data[cycleDate.toDateString()][1] + delta) * 100) / 100;
                                cycleDate = cycleDate.addDays(1);
                            }
                            now = now.addMonth(1);
                        }
                    }
                }
                callback(conti);
            });
        });
    };
    // Calcola il numero di mesi rimasti di sopravvivenza
    DatabaseModule.prototype.getMesiRimanenti = function (callback) {
        var component = this;
        component.getBilancioPerConto("2023-12-31", function (conti) {
            component.executeQueryFromFile("./queries/ricorrenti/ricorrentiCategorie.sql", {}, function (results) {
                var mesiSuperati = 0;
                var valid = true;
                while (valid) {
                    for (var i = 0; i < results.length; i++) {
                        for (var j = 0; j < conti.length; j++) {
                            if (conti[j].idConto == results[i].idContoFrom) {
                                if (results[i].isEntrata == 1) {
                                    conti[j].valore += results[i].importo;
                                }
                                else if (results[i].isUscita == 1) {
                                    conti[j].valore -= results[i].importo;
                                }
                            }
                        }
                    }
                    for (var i = 0; i < conti.length; i++) {
                        if (conti[i].valore < 0) {
                            valid = false;
                        }
                    }
                    if (valid) {
                        mesiSuperati++;
                    }
                }
                callback(mesiSuperati);
            });
        });
    };
    DatabaseModule.prototype.getUsciteMensiliCategoriaParent = function (anno, callback) {
        var component = this;
        component.executeQueryFromFile('./queries/misc/uscitePerMeseCategoriaParent.sql', { "anno": anno.toString() }, function (results) {
            component.executeQueryFromFile('./queries/categorie/uscitaParent.sql', {}, function (categorie) {
                for (var i = 0; i < categorie.length; i++) {
                    categorie[i].mesi = [];
                    for (var j = 0; j < 12; j++) {
                        categorie[i].mesi[j] = 0;
                    }
                }
                for (var i = 0; i < results.length; i++) {
                    if (results[i].idCategoriaParent == null) {
                        for (var j = 0; j < categorie.length; j++) {
                            if (results[i].idCategoria == categorie[j].idCategoria) {
                                categorie[j].mesi[results[i].mese - 1] += results[i].importo;
                            }
                        }
                    }
                    else {
                        for (var j = 0; j < categorie.length; j++) {
                            if (results[i].idCategoriaParent == categorie[j].idCategoria) {
                                categorie[j].mesi[results[i].mese - 1] += results[i].importo;
                            }
                        }
                    }
                }
                for (var i = 0; i < categorie.length; i++) {
                    for (var j = 0; j < 12; j++) {
                        categorie[i].mesi[j] = Math.round(categorie[i].mesi[j] * 100) / 100;
                    }
                }
                callback(categorie);
            });
        });
    };
    DatabaseModule.prototype.getUsciteMensiliCategoriaChild = function (anno, parent, callback) {
        var component = this;
        component.executeQueryFromFile('./queries/misc/uscitePerMeseCategoriaChild.sql', { "idParent": parent, "anno": anno.toString() }, function (results) {
            component.executeQueryFromFile("./queries/categorie/uscitaChild.sql", { "idParent": parent }, function (categorie) {
                for (var i = 0; i < categorie.length; i++) {
                    categorie[i].mesi = [];
                    for (var j = 0; j < 12; j++) {
                        categorie[i].mesi[j] = 0;
                    }
                }
                for (var i = 0; i < results.length; i++) {
                    for (var j = 0; j < categorie.length; j++) {
                        if (results[i].idCategoria == categorie[j].idCategoria) {
                            categorie[j].mesi[results[i].mese - 1] += results[i].importo;
                            break;
                        }
                    }
                }
                for (var i = 0; i < categorie.length; i++) {
                    for (var j = 0; j < 12; j++) {
                        categorie[i].mesi[j] = Math.round(categorie[i].mesi[j] * 100) / 100;
                    }
                }
                callback(categorie);
            });
        });
    };
    DatabaseModule.prototype.getUsciteMensiliUltimoAnno = function (callback) {
        var component = this;
        component.executeQueryFromFile('./queries/misc/usciteMensiliUltimoAnno.sql', { 'anno': 2023 }, function (results) {
            callback(results);
        });
    };
    // Inserisci una nuova transazione
    DatabaseModule.prototype.insertTransazioneNow = function (importo, idCategoria, idContoFrom, idContoTo, nota, descrizione, callback) {
        var sql = "INSERT INTO Transazioni (dateTime, importo, idCategoria, idContoFrom, idContoTo, idCurrency, nota, descrizione) VALUES (NOW(), " + importo + ", " + idCategoria + ", " + idContoFrom + ", " + idContoTo + ", 1, '" + nota + "', '" + descrizione + "');";
        this.executeQuery(sql, function (results) {
            callback(results);
        });
    };
    return DatabaseModule;
}());
exports.DatabaseModule = DatabaseModule;
