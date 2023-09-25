const mysql = require('mysql2');
const fs = require('fs');

const MSTOGG = 1000 * 60 * 60 * 24;

class DatabaseModule {
  constructor(db_host, db_user, db_pass, db_name){
    this.db = mysql.createConnection({
      host: db_host,
      user: db_user,
      password: db_pass,
      database: db_name
    });
  
    let component = this;
    this.db.connect(function(err){
      if(err) throw err;
      component.is_connected = true;
      console.log("DB: Connected!");
    });
  
    this.db.connect();
  }

  dateToDBString(date){
    // ANNO
    let stringDate = date.getFullYear() + "-";
    
    // MESE
    if(date.getMonth() +1 < 10){
      stringDate += "0" + (date.getMonth()+1).toString() + "-";
    }
    else{
      stringDate += (date.getMonth()+1).toString() + "-";
    }

    // GIORNO
    if(date.getDate() < 10){
      stringDate += "0" + date.getDate();
    }
    else{
      stringDate += date.getDate();
    }

    return stringDate;
  }

  DBdateToString(date){
    return date.toISOString().split('T')[0];
  }

  isConnected(){
    return this.is_connected;
  }

  executeQuery(query, callback){
    if(!this.is_connected){
      console.log("DB: Not connected!");
      return;
    }

    //console.log(query);
    this.db.query(query, function(err, result){
      if(err) throw err;
      callback(result);
    });
  }

  executeQueryFromFile(queryFilePath, callback){
    //Leggi file
    fs.readFile(queryFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      //Esegui query
      this.executeQuery(data, function(result){
        callback(result);
      });
    });  
  }

  // Categorie in uscita che hanno una categoria padre
  selectCategorieUscitaChild(idParent, callback){
    let sql = "SELECT * FROM Categorie WHERE idCategoriaParent = " + idParent + " AND isUscita = 1 AND isDeleted = 0;";

    this.executeQuery(sql, function(result){
      callback(result);
    });
  }

  // Categoria in entrata che hanno una categoria padre
  selectCategorieEntrataChild(idParent, callback){
    let sql = "SELECT * FROM Categorie WHERE idCategoriaParent = " + idParent + " AND isEntrata = 1 AND isDeleted = 0;";

    this.executeQuery(sql, function(result){
      callback(result);
    });
  }

  getUscitePerContoToDate(end, callback){
    let sql = "SELECT SUM(importo) AS 'uscite', idContoFrom \
    FROM Transazioni AS T, Categorie AS C \
    WHERE T.idCategoria = C.idCategoria \
    AND C.isUscita = 1 AND T.dateTime < \"" + end + "\" \
    AND T.isDeleted = 0 AND C.isDeleted = 0 \
    GROUP BY idContoFrom \
    ORDER BY idContoFrom ASC; \
    ";

    //console.log(sql);
    this.executeQuery(sql, function(result){
      callback(result);
    });
  }

  getEntratePerContoToDate(end, callback){
    let sql = "SELECT SUM(T.importo) AS 'entrate', T.idContoFrom \
    FROM Transazioni AS T, Categorie AS C \
    WHERE T.idCategoria = C.idCategoria \
    AND C.isEntrata = 1 AND T.dateTime < \"" + end + "\" \
    AND T.isDeleted = 0 AND C.isDeleted = 0 \
    GROUP BY T.idContoFrom \
    ORDER BY T.idContoFrom ASC; \
    ";

    this.executeQuery(sql, function(result){
      callback(result);
    });
  }

  getTrasferimentiUscitaPerContoToDate(end, callback){
    let sql = "SELECT SUM(importo) AS 'transazioniUscita', idContoFrom \
    FROM Transazioni \
    WHERE idContoTo IS NOT NULL AND idContoFrom IS NOT NULL AND dateTime < \"" + end + "\" \
    AND isDeleted = 0 \
    GROUP BY idContoFrom \
    ORDER BY idContoFrom ASC;";

    this.executeQuery(sql, function(result){
      callback(result);
    });
  }

  getTrasferimentiEntrataPerContoToDate(end, callback){
    let sql = "SELECT SUM(importo) AS 'transazioniEntrata', idContoTo \
    FROM Transazioni \
    WHERE idContoTo IS NOT NULL AND idContoFrom IS NOT NULL AND dateTime < \"" + end + "\" \
    AND isDeleted = 0 \
    GROUP BY idContoTo \
    ORDER BY idContoTo ASC; \
    ";

    this.executeQuery(sql, function(result){
      callback(result);
    });
  }

  // Bilancio per ogni conto fino al end (data)
  getBilancioPerConto(end, callback){
    let component = this;
    component.executeQueryFromFile('./queries/misc/contiAndGruppo.sql', function(conti){
      component.getUscitePerContoToDate(end, function(uscite){
        component.getEntratePerContoToDate(end, function(entrate){
          component.getTrasferimentiUscitaPerContoToDate(end, function(transazioniUscita){
            component.getTrasferimentiEntrataPerContoToDate(end, function(transazioniEntrata){
              let totale = 0;
              for(let i = 0; i < conti.length; i++){
                //console.log(conti[i]);
                conti[i].valore = conti[i].valoreIniziale;
                for(let j = 0; j < uscite.length; j++){
                  if(conti[i].idConto == uscite[j].idContoFrom){
                    //console.log(uscite[j]);
                    conti[i].valore -= uscite[j].uscite;
                  }
                }
                for(let j = 0; j < entrate.length; j++){
                  if(conti[i].idConto == entrate[j].idContoFrom){
                    //console.log(entrate[j]);
                    conti[i].valore += entrate[j].entrate;
                  }
                }
                for(let j = 0; j < transazioniEntrata.length; j++){
                  if(conti[i].idConto == transazioniEntrata[j].idContoTo){
                    //console.log(transazioni[j]);
                    conti[i].valore += transazioniEntrata[j].transazioniEntrata;
                  }
                }
                for(let j = 0; j < transazioniUscita.length; j++){
                  if(conti[i].idConto == transazioniUscita[j].idContoFrom){
                    //console.log(transazioni[j]);
                    conti[i].valore -= transazioniUscita[j].transazioniUscita;
                  }
                }
                conti[i].valore = Math.round(conti[i].valore * 100) / 100;

                totale += conti[i].valore;
              }
              totale = Math.round(totale * 100) / 100;
              conti.push({idConto: -1, conto: 'Totale', gruppoConto:'', valore: totale});
              
              callback(conti);
            });
          });
        });
      });
    });
  }

  getBilancioPerContoAnnuoPerMese(anno, callback){
    let component = this;
    component.getBilancioPerConto((anno - 1).toString() + '-12-31', function(conti){
      for(let i = 0; i < conti.length; i++){
        conti[i].data = [];
        for(let j = 0; j < 12; j++){
          conti[i].data.push(Math.round(conti[i].valore * 100) / 100);
        }
      }

      component.selectTransazioni(anno.toString() + '-01-01', anno.toString() + '-12-31', function(transazioni){
        component.selectTrasferimenti(anno.toString() + '-01-01', anno.toString() + '-12-31', function(trasferimenti){
          for(let i = 0; i < trasferimenti.length; i++){
            transazioni.push(trasferimenti[i]);
          }

          for(let i = 0; i < transazioni.length; i++){
            if(transazioni[i].custom == true){
              transazioni[i].dateTime = transazioni[i].dateTime;
            }
            else{
              transazioni[i].dateTime = component.DBdateToString(transazioni[i].dateTime);
            }
          }

          for(let i = 0; i < transazioni.length - 1; i++){
            for(let j = i + 1;j < transazioni.length; j++){
              if(transazioni[i].dateTime > transazioni[j].dateTime){
                let tmp = transazioni[i];
                transazioni[i] = transazioni[j];
                transazioni[j] = tmp;
              }
            }
          }
          
          for(let i = 0; i < transazioni.length; i++){
            
            let index_contoFrom = -1;
            let index_contoTo = -1;
            //console.log(transazioni[i]);

            

            if(transazioni[i].idCategoria == null){
              //console.log("Trasferimento");
              // Trasferimento
              for(let j = 0; j < conti.length; j++){
                if(conti[j].idConto == transazioni[i].idContoFrom){
                  conti[j].valore -= transazioni[i].importo;
                  index_contoFrom = j;
                }
                else if(conti[j].idConto == transazioni[i].idContoTo){
                  conti[j].valore += transazioni[i].importo;
                  index_contoTo = j;
                }
              }

              //console.log("valore from: " + conti[index_contoFrom].valore);

              //console.log("valore to: " + conti[index_contoTo].valore);
            } 
            else{
              //console.log("E/U");
              for(let j = 0; j < conti.length; j++){
                if(conti[j].idConto == transazioni[i].idContoFrom){
                  index_contoFrom = j;
                  if(transazioni[i].isUscita == 1){ //Uscita
                    conti[j].valore -= transazioni[i].importo;
                  }
                  else if(transazioni[i].isEntrata == 1){ //Entrata
                    conti[j].valore += transazioni[i].importo;
                  }
                }
              }
              //console.log("valore: " + conti[index_contoFrom].valore);
            }
            //console.log("index_contoFrom: " + index_contoFrom);

            if(index_contoFrom != -1){
              let index_mese = parseInt(transazioni[i].dateTime.split('-')[1]) - 1;
              //console.log("index_mese: " + index_mese);
              for(let j = index_mese; j < 12; j++){
                conti[index_contoFrom].data[j] = Math.round(conti[index_contoFrom].valore * 100) / 100;
              }
            }
            //console.log("index_contoTo: " + index_contoTo);
            
            if(index_contoTo != -1){
              let index_mese = parseInt(transazioni[i].dateTime.split('-')[1]) - 1;
              //console.log("index_mese: " + index_mese);
              for(let j = index_mese; j < 12; j++){
                conti[index_contoTo].data[j] = Math.round(conti[index_contoTo].valore * 100) / 100;
              }
            }

            /*if(transazioni[i].idContoFrom == 1 || transazioni[i].idContoTo == 1){
              console.log(conti[0].conto + " " + transazioni[i].dateTime + " " + transazioni[i].idContoFrom + " " + transazioni[i].idContoTo + " " + transazioni[i].idCategoria + " " + transazioni[i].importo + " " +  (Math.round(conti[0].valore * 100) / 100).toString());
            }*/
          }

          //Set totale
          conti[conti.length - 1].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          for(let i = 0; i < conti.length - 1; i++){
            for(let j = 0; j < 12; j++){
              conti[conti.length - 1].data[j] += conti[i].data[j];
            }
          }
          for(let i = 0; i < 12; i++){
            conti[conti.length - 1].data[i] = Math.round(conti[conti.length - 1].data[i] * 100) / 100;
          }
          callback(conti);
        });
      });
    });
  }

  getBilancioPerContoAnnuoPerGiorno(anno, callback){
    let component = this;
    let beginYear = anno.toString() + '-01-01';
    let endYear = anno.toString() + '-12-31';
    let endLastYear = (anno - 1).toString() + '-12-31';
    let dateBeginYear = Date.parse(beginYear);
    let dateEndYear = Date.parse(endYear);
    let dayToCount = (dateEndYear - dateBeginYear) / MSTOGG;


    component.getBilancioPerConto(endLastYear, function(conti){
      conti[conti.length - 1].valore = 0;
      for(let i = 0; i < conti.length; i++){
        conti[i].data = [];
        for(let j = 0; j < dayToCount; j++){
          conti[i].data.push([(dateBeginYear + (j * MSTOGG)), Math.round(conti[i].valore * 100) / 100]);
        }
      }

      component.selectTransazioni(beginYear, endYear, function(transazioni){
        component.selectTrasferimenti(beginYear, endYear, function(trasferimenti){
          for(let i = 0; i < trasferimenti.length; i++){
            transazioni.push(trasferimenti[i]);
          }

          for(let i = 0; i < transazioni.length; i++){
            if(transazioni[i].custom == true){
              transazioni[i].dateTime = transazioni[i].dateTime;
            }
            else{
              transazioni[i].dateTime = component.DBdateToString(transazioni[i].dateTime);
            }
          }

          for(let i = 0; i < transazioni.length - 1; i++){
            for(let j = i + 1;j < transazioni.length; j++){
              if(transazioni[i].dateTime > transazioni[j].dateTime){
                let tmp = transazioni[i];
                transazioni[i] = transazioni[j];
                transazioni[j] = tmp;
              }
            }
          }
          
          for(let i = 0; i < transazioni.length; i++){
            
            let index_contoFrom = -1;
            let index_contoTo = -1;
            //console.log(transazioni[i]);

            if(transazioni[i].idCategoria == null){
              //console.log("Trasferimento");
              // Trasferimento
              for(let j = 0; j < conti.length; j++){
                if(conti[j].idConto == transazioni[i].idContoFrom){
                  conti[j].valore -= transazioni[i].importo;
                  index_contoFrom = j;
                }
                else if(conti[j].idConto == transazioni[i].idContoTo){
                  conti[j].valore += transazioni[i].importo;
                  index_contoTo = j;
                }
              }

              //console.log("valore from: " + conti[index_contoFrom].valore);

              //console.log("valore to: " + conti[index_contoTo].valore);
            } 
            else{
              //console.log("E/U");
              for(let j = 0; j < conti.length; j++){
                if(conti[j].idConto == transazioni[i].idContoFrom){
                  index_contoFrom = j;
                  if(transazioni[i].isUscita == 1){ //Uscita
                    conti[j].valore -= transazioni[i].importo;
                  }
                  else if(transazioni[i].isEntrata == 1){ //Entrata
                    conti[j].valore += transazioni[i].importo;
                  }
                }
              }
              //console.log("valore: " + conti[index_contoFrom].valore);
            }
            //console.log("index_contoFrom: " + index_contoFrom);

            let tmp_date = Date.parse(transazioni[i].dateTime);
            let index_day = (tmp_date-dateBeginYear) / MSTOGG;

            if(index_contoFrom != -1){
              for(let j = index_day; j < dayToCount; j++){
                conti[index_contoFrom].data[j] = [tmp_date, Math.round(conti[index_contoFrom].valore * 100) / 100 ];
              }
            }
            //console.log("index_contoTo: " + index_contoTo);
            
            if(index_contoTo != -1){
              for(let j = index_day; j < dayToCount; j++){
                conti[index_contoTo].data[j] = [tmp_date, Math.round(conti[index_contoTo].valore * 100) / 100 ];
              }
            }

            /*if(transazioni[i].idContoFrom == 1 || transazioni[i].idContoTo == 1){
              console.log(conti[0].conto + " " + transazioni[i].dateTime + " " + transazioni[i].idContoFrom + " " + transazioni[i].idContoTo + " " + transazioni[i].idCategoria + " " + transazioni[i].importo + " " +  (Math.round(conti[0].valore * 100) / 100).toString());
            }*/
          }

          //Set totale
          for(let i = 0; i < conti.length - 1; i++){
            for(let j = 0; j < dayToCount; j++){
              conti[conti.length - 1].data[j][1] += conti[i].data[j][1];
            }
          }
          for(let i = 0; i < dayToCount; i++){
            conti[conti.length - 1].data[i][1] = Math.round(conti[conti.length - 1].data[i][1] * 100) / 100;
          }
          callback(conti);
        });
      });
      //callback(conti);
    });
  }


  // Calcola il numero di mesi rimasti di sopravvivenza
  getMesiRimanenti(callback){
    let component = this;
    this.getBilancioPerConto("2023-12-31", function(conti){
      let sql = "SELECT importo, giorniDifferenza, R.idCategoria, idContoFrom, isMonthly, isEntrata, isUscita FROM Ricorrenti AS R, Categorie AS C WHERE R.idCategoria = C.idCategoria AND C.isDeleted = 0;";

      component.executeQuery(sql, function(results){
        let mesiSuperati = 0;
          let valid = true;
          while (valid){
            for(let i = 0; i < results.length; i++){
              for(let j = 0; j < conti.length; j++){
                if(conti[j].idConto == results[i].idContoFrom){
                  if(results[i].isEntrata == 1){
                    conti[j].valore += results[i].importo;
                  }
                  else if(results[i].isUscita == 1){
                    conti[j].valore -= results[i].importo;
                  }
                }
              }
            }
            for(let i = 0; i < conti.length; i++){
              if(conti[i].valore < 0){
                valid = false;
              }
            }
            if(valid){
              mesiSuperati++;
            }
          }
          callback(mesiSuperati);
      });
    });
  }

  selectTransazioni(dataInizio, dataFine, callback){
    let sql = "SELECT * FROM Transazioni AS T, Categorie AS C WHERE T.idCategoria = C.idCategoria AND T.dateTime >= '" + dataInizio + "' AND T.dateTime < '" + dataFine + "' AND T.isDeleted = 0 AND C.isDeleted = 0 ORDER BY T.dateTime ASC;";
    
    this.executeQuery(sql, function(result){
      callback(result);
    });
  }

  selectTrasferimenti(dataInizio, dataFine, callback){
    let sql = "SELECT * \
    FROM Transazioni \
    WHERE idContoTo IS NOT NULL AND idContoFrom IS NOT NULL AND dateTime >= '" + dataInizio + "' AND dateTime < '" + dataFine + "' \
    AND isDeleted = 0 \
    ORDER BY dateTime ASC; \
    ";
    this.executeQuery(sql, function(result){
      callback(result);
    });
  }

  // Transazioni comprese fra dataMin e dataMax con una di quelle priorita
  selectTransazioniConPriorita(priorita, dataInizio, dataFine, callback){
    let sql = 'SELECT * FROM Transazioni AS T, Categorie AS C WHERE T.idCategoria = C.idCategoria AND C.priorita IN (' + priorita + ') AND T.dateTime >= \'' + dataInizio + '\' AND T.dateTime < \'' + dataFine + '\' AND T.isDeleted = 0 AND C.isDeleted = 0;';
    
    this.executeQuery(sql, function(results){
      callback(results);
    });
  }

  // Inserisci una nuova transazione
  insertTransazioneNow(importo, idCategoria, idContoFrom, idContoTo, nota, descrizione, callback){
    let sql = "INSERT INTO Transazioni (dateTime, importo, idCategoria, idContoFrom, idContoTo, idCurrency, nota, descrizione) VALUES (NOW(), " + importo + ", " + idCategoria + ", " + idContoFrom + ", " + idContoTo + ", 1, '" + nota + "', '" + descrizione + "');";

    this.executeQuery(sql, function(results){
      callback(results);
    });
  }

  getUsciteMensiliCategoriaParent(anno, callback){
    let component = this;
    let sql = "SELECT C.nome AS 'nome', SUM(T.importo) AS 'importo', MONTH(T.DATETIME) AS 'mese', C.idCategoriaParent " +
      "FROM Transazioni AS T, Categorie AS C " +
      "WHERE T.idCategoria = C.idCategoria AND YEAR(T.DATETIME) = " + anno.toString() + " AND T.idCategoria IS NOT NULL AND C.isUscita = 1 AND T.isDeleted = 0 AND C.isDeleted = 0 " +
      "GROUP BY T.idCategoria, YEAR(T.DATETIME), MONTH(T.DATETIME) " +
      "ORDER BY MONTH(T.DATETIME) ASC, C.nome ASC;";

    //console.log(sql);
    this.executeQuery(sql, function(results){
      component.executeQueryFromFile('./queries/categorie/uscitaParent.sql', function(categorie){
        for(let i = 0; i < categorie.length; i++){
          categorie[i].mesi = [];
          for(let j = 0; j < 12; j++){
            categorie[i].mesi[j] = 0;
          }
        }

        for(let i = 0; i < results.length; i++){
          if(results[i].idCategoriaParent == null){
            for(let j = 0; j < categorie.length; j++){
              if(results[i].idCategoria == categorie[j].idCategoria){
                categorie[j].mesi[results[i].mese - 1] += results[i].importo;
              }
            }
          }
          else{
            for(let j = 0; j < categorie.length; j++){
              if(results[i].idCategoriaParent == categorie[j].idCategoria){
                categorie[j].mesi[results[i].mese - 1] += results[i].importo;
              }
            }
          }
        }

        for(let i = 0; i < categorie.length; i++){
          for(let j = 0; j < 12; j++){
            categorie[i].mesi[j] = Math.round(categorie[i].mesi[j] * 100) / 100;
          }
        }

        callback(categorie);
      });
    });
  }

  getUsciteMensiliCategoriaChild(anno, parent, callback){
    let component = this;
    let sql = "SELECT C.nome AS 'nome', C.idCategoria AS 'idCategoria', SUM(T.importo) AS 'importo', MONTH(T.DATETIME) AS 'mese', C.idCategoriaParent " +
      "FROM Transazioni AS T, Categorie AS C " +
      "WHERE T.idCategoria = C.idCategoria AND YEAR(T.DATETIME) = " + anno.toString() + " AND T.idCategoria IS NOT NULL AND C.isUscita = 1 AND C.idCategoriaParent = " + parent + " AND T.isDeleted = 0 AND C.isDeleted = 0 " +
      "GROUP BY T.idCategoria, YEAR(T.DATETIME), MONTH(T.DATETIME) " +
      "ORDER BY MONTH(T.DATETIME) ASC, C.nome ASC;";
      
    this.executeQuery(sql, function(results){
      component.selectCategorieUscitaChild(parent, function(categorie){
        for(let i = 0; i < categorie.length; i++){
          categorie[i].mesi = [];
          for(let j = 0; j < 12; j++){
            categorie[i].mesi[j] = 0;
          }
        }

        for(let i = 0; i < results.length; i++){
          for(let j = 0; j < categorie.length; j++){
            if(results[i].idCategoria == categorie[j].idCategoria){
              categorie[j].mesi[results[i].mese - 1] += results[i].importo;
              break;
            }
          }
        }

        for(let i = 0; i < categorie.length; i++){
          for(let j = 0; j < 12; j++){
            categorie[i].mesi[j] = Math.round(categorie[i].mesi[j] * 100) / 100;
          }
        }

        callback(categorie);
      });
    });
  }

  getUsciteMensiliUltimoAnno(callback){
    let anno = 2023;
    let sql = "SELECT C.nome AS 'nome', SUM(T.importo) AS 'importo', MONTH(T.DATETIME) AS 'mese' " +
      "FROM Transazioni AS T, Categorie AS C " +
      "WHERE T.idCategoria = C.idCategoria AND YEAR(T.DATETIME) = " + anno.toString() + " AND T.idCategoria IS NOT NULL AND C.isUscita = 1 " +
      "GROUP BY T.idCategoria, YEAR(T.DATETIME), MONTH(T.DATETIME) " +
      "ORDER BY MONTH(T.DATETIME) ASC, C.nome ASC;";

    this.executeQuery(sql, function(results){
      callback(results);
    });
  }
}

module.exports = DatabaseModule;