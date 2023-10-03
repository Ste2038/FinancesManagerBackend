const TelegramBot  = require('node-telegram-bot-api');
const DatabaseModule = require('./databaseModule');

class TelegramModule {
  master_id = 0;
  bot = null;
  fsmData = [];
  database = null;

  constructor(token, master_id, database, sendInitialMessage = false){
    let component = this;
    this.bot = new TelegramBot(token, {polling: true});
    
    this.master_id = master_id;
    this.database = database;

    if(sendInitialMessage){
      this.sendInitialMessage(this.master_id);
    }

    this.bot.on('message', async (msg) => {
      console.log("From " + msg.chat.id + " : " + msg.text);

      if (msg.chat.id == component.master_id){
        switch(msg.text.toLowerCase()){
          case "/start":
            component.sendInitialMessage(msg.chat.id);
          break;

          case "spesa":
            component.fsmData[msg.chat.id] = {};
            component.fsmData[msg.chat.id].step = 1;
            component.fsmData[msg.chat.id].lastMessage = await component.bot.sendMessage(msg.chat.id, "🛒 Spesa\nImporto?");
          break;

          case "guadagno":
            component.fsmData[msg.chat.id] = {};
            component.fsmData[msg.chat.id].step = 2;
            component.fsmData[msg.chat.id].lastMessage = await component.bot.sendMessage(msg.chat.id, "🤑 Guadagno\nImporto?");
          break;

          case "trasferimento":
            component.fsmData[msg.chat.id] = {};
            component.fsmData[msg.chat.id].step = 3;
            component.fsmData[msg.chat.id].lastMessage = await component.bot.sendMessage(msg.chat.id, "➡️ Trasferimento\nImporto?");
          break;

          case "agg. conto":
          break;

          case "/bilancio":
          case "bilancio":
            component.database.getBilancioPerConto(function(bilancio){
              if(bilancio.status == 'error'){
                component.bot.sendMessage(msg.chat.id, "Errore nel recupero del bilancio");
              }
              else{
                let msgText = "Bilancio:\n";
                for(let i = 0; i < bilancio.length; i++){
                  msgText += bilancio[i].conto + ": " + bilancio[i].valore + "\n";
                }
                component.bot.sendMessage(msg.chat.id, msgText);
              }
            });
          break;

          default:
            let doneAnything = false;

            if(parseInt(msg.text)){
              let importo = parseInt(msg.text);

              switch(component.fsmData[msg.chat.id].step){
                case 1:
                  await component.database.executeQueryFromFile('./queries/categorie/uscitaParent.sql', {}, async function(categorieParent){
                    let inline_keyboard = [];

                    for(let i = 0; i < categorieParent.length; i++){
                      if(i % 3 == 0){
                        inline_keyboard[i/3] = [];
                      }
                      inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: categorieParent[i].nome, callback_data: categorieParent[i].idCategoria };
                    }

                    component.fsmData[msg.chat.id].importo = importo;
                    component.fsmData[msg.chat.id].step = 11;
                    await component.bot.editMessageText("🛒 Spesa\nImporto: " + importo + "€\nCategoria?", {
                      chat_id: msg.chat.id,
                      message_id: component.fsmData[msg.chat.id].lastMessage.message_id,
                      reply_markup: { 
                        inline_keyboard,
                      },
                    });
                  });
                  doneAnything = true;
                break;

                case 2:
                  await component.database.executeQueryFromFile('./queries/categorie/entrataParent.sql', {}, async function(categorieParent){
                    let inline_keyboard = [];

                    for(let i = 0; i < categorieParent.length; i++){
                      if(i % 3 == 0){
                        inline_keyboard[i/3] = [];
                      }
                      inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: categorieParent[i].nome, callback_data: categorieParent[i].idCategoria };
                    }

                    component.fsmData[msg.chat.id].importo = importo;
                    component.fsmData[msg.chat.id].step = 21;
                    await component.bot.editMessageText("🤑 Guadagno\nImporto: " + importo + "€\nCategoria?", {
                      chat_id: msg.chat.id,
                      message_id: component.fsmData[msg.chat.id].lastMessage.message_id,
                      reply_markup: { 
                        inline_keyboard,
                      },
                    });
                  });
                  doneAnything = true;                  
                break;

                case 3:
                  await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){
                    let inline_keyboard = [];
                    for(let i = 0; i < conti.length; i++){
                      if(i % 3 == 0){
                        inline_keyboard[i/3] = [];
                      }
                      inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
                    }
      
                    component.fsmData[msg.chat.id].importo = importo;
                    component.fsmData[msg.chat.id].step = 31;
                    await component.bot.editMessageText("➡️ Trasferimento\nImporto: " + importo + "€\nConto from?", {
                      chat_id: msg.chat.id,
                      message_id: component.fsmData[msg.chat.id].lastMessage.message_id,
                      reply_markup: { 
                        inline_keyboard,
                      },
                    });
                  });
                  doneAnything = true; 
                break;
              }
            }
            
            if(!doneAnything)
              component.sendMessage(msg.chat.id, "Non capisco, mi dispiace!");
        }
      }
      else {
        component.sendMessage(msg.chat.id, "Clearly this is not your place to be.");
        component.sendMessage(component.master_id, "Qualcuno sta cercando di accedere: " + msg.chat.id);
      }
    });

    this.bot.on("polling_error", (err) => console.log(err));

    this.bot.on("callback_query", async(msg) => {
      console.log("Bot callback_query: " + JSON.stringify(msg.data));

      switch(component.fsmData[msg.message.chat.id].step){
        case 11:
          await component.database.executeQueryFromFile('./queries/categorie/uscitaParent.sql', {}, async function(categorieParent){
            let nomeParent;
            for(let i = 0; i < categorieParent.length; i++){
              if(categorieParent[i].idCategoria == msg.data){
                nomeParent = categorieParent[i].nome;
                break;
              }
            }
            
            await component.database.executeQueryFromFile("./queries/categorie/uscitaChild.sql", {"idParent": parseInt(msg.data)}, async function(categorieChild){
              let inline_keyboard = [];

              if(categorieChild.length == 0){
                await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){
                  let inline_keyboard = [];
                  for(let i = 0; i < conti.length; i++){
                    if(i % 3 == 0){
                      inline_keyboard[i/3] = [];
                    }
                    inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
                  }
    
                  component.fsmData[msg.message.chat.id].idCategoriaChild = parseInt(msg.data);
                  component.fsmData[msg.message.chat.id].nomeCategoria = nomeParent;
                  component.fsmData[msg.message.chat.id].step = 13;
                  await component.bot.editMessageText("🛒 Spesa\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto?" , {
                    chat_id: msg.message.chat.id,
                    message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                    reply_markup: { 
                      inline_keyboard,
                    },
                  });
                });
              }
              else{
                for(let i = 0; i < categorieChild.length; i++){
                  if(i % 3 == 0){
                    inline_keyboard[i/3] = [];
                  }
                  inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: categorieChild[i].nome, callback_data: categorieChild[i].idCategoria };
                }

                component.fsmData[msg.message.chat.id].idCategoriaParent = parseInt(msg.data);
                component.fsmData[msg.message.chat.id].nomeCategoria = nomeParent;
                component.fsmData[msg.message.chat.id].step = 12;
                await component.bot.editMessageText("🛒 Spesa\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + nomeParent + "/ ?" , {
                  chat_id: msg.message.chat.id,
                  message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                  reply_markup: { 
                    inline_keyboard,
                  },
                });   
              }
            });
          });
        break;

        case 12:
          await component.database.executeQueryFromFile("./queries/categorie/uscitaChild.sql", {"idParent": component.fsmData[msg.message.chat.id].idCategoriaParent}, async function(categorieChild){
            let nomeChild;

            for(let i = 0; i < categorieChild.length; i++){
              if(categorieChild[i].idCategoria == msg.data){
                nomeChild = categorieChild[i].nome;
                break;
              }
            }

            await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){
              let inline_keyboard = [];
              for(let i = 0; i < conti.length; i++){
                if(i % 3 == 0){
                  inline_keyboard[i/3] = [];
                }
                inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
              }

              component.fsmData[msg.message.chat.id].idCategoriaChild = parseInt(msg.data);
              component.fsmData[msg.message.chat.id].nomeCategoria += "/" + nomeChild;
              component.fsmData[msg.message.chat.id].step = 13;
              await component.bot.editMessageText("🛒 Spesa\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto?" , {
                chat_id: msg.message.chat.id,
                message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                reply_markup: { 
                  inline_keyboard,
                },
              });
            });
          });
        break;
      
        case 13:
          await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){
            let nomeConto;

            for(let i = 0; i < conti.length; i++){
              if(conti[i].idConto == msg.data){
                nomeConto = conti[i].nome;
                break;
              }
            }

            let inline_keyboard = [];
            inline_keyboard[0] = [];
            inline_keyboard[0][0] = { text: "Fatto ", callback_data: "-1" };

            component.fsmData[msg.message.chat.id].idConto = parseInt(msg.data);
            component.fsmData[msg.message.chat.id].nomeConto = nomeConto;
            component.fsmData[msg.message.chat.id].step = 14;
            await component.bot.editMessageText("🛒 Spesa\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto: " + nomeConto + "\nDescrizione?", {
              chat_id: msg.message.chat.id,
              message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
              reply_markup: { 
                  inline_keyboard,
                },
            });
          });
        break;
      
        case 14:
          await component.database.insertTransazioneNow(component.fsmData[msg.message.chat.id].importo, component.fsmData[msg.message.chat.id].idCategoriaChild, component.fsmData[msg.message.chat.id].idConto, null, " ", " ", async function (result){
            component.fsmData[msg.message.chat.id].step = 0;
            let message = "🛒 Spesa\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto: " + component.fsmData[msg.message.chat.id].nomeConto + "\nDescrizione: \nId: " + result.insertId + "\nSalvato!";
            await component.bot.editMessageText(message, {
              chat_id: msg.message.chat.id,
              message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
            });
          });
        break;
      
        case 21:
          await component.database.executeQueryFromFile('./queries/categorie/entrataParent.sql', {}, async function(categorieParent){
            let nomeParent;
            for(let i = 0; i < categorieParent.length; i++){
              if(categorieParent[i].idCategoria == msg.data){
                nomeParent = categorieParent[i].nome;
                break;
              }
            }

            await component.database.executeQueryFromFile("./queries/categorie/entrataChild.sql", {"idParent": parseInt(msg.data)}, async function(categorieChild){
              let inline_keyboard = [];

              if(categorieChild.length == 0){
                await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){
                  let inline_keyboard = [];
                  for(let i = 0; i < conti.length; i++){
                    if(i % 3 == 0){
                      inline_keyboard[i/3] = [];
                    }
                    inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
                  }
    
                  component.fsmData[msg.message.chat.id].idCategoriaChild = parseInt(msg.data);
                  component.fsmData[msg.message.chat.id].nomeCategoria = nomeParent;
                  component.fsmData[msg.message.chat.id].step = 23;
                  await component.bot.editMessageText("🤑 Guadagno\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto?" , {
                    chat_id: msg.message.chat.id,
                    message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                    reply_markup: { 
                      inline_keyboard,
                    },
                  });
                });
              }
              else{
                for(let i = 0; i < categorieChild.length; i++){
                  if(i % 3 == 0){
                    inline_keyboard[i/3] = [];
                  }
                  inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: categorieChild[i].nome, callback_data: categorieChild[i].idCategoria };
                }

                component.fsmData[msg.message.chat.id].idCategoriaParent = parseInt(msg.data);
                component.fsmData[msg.message.chat.id].nomeCategoria = nomeParent;
                component.fsmData[msg.message.chat.id].step = 22;
                await component.bot.editMessageText("🤑 Guadagno\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + nomeParent + "/ ?" , {
                  chat_id: msg.message.chat.id,
                  message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                  reply_markup: { 
                    inline_keyboard,
                  },
                });
              }
            });
          });
        break;
      
        case 22:
          await component.database.executeQueryFromFile("./queries/categorie/entrataChild.sql", {"idParent": component.fsmData[msg.message.chat.id].idCategoriaParent}, async function(categorieChild){
            let nomeChild;

            for(let i = 0; i < categorieChild.length; i++){
              if(categorieChild[i].idCategoria == msg.data){
                nomeChild = categorieChild[i].nome;
                break;
              }
            }

            await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){
              let inline_keyboard = [];
              for(let i = 0; i < conti.length; i++){
                if(i % 3 == 0){
                  inline_keyboard[i/3] = [];
                }
                inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
              }

              component.fsmData[msg.message.chat.id].idCategoriaChild = parseInt(msg.data);
              component.fsmData[msg.message.chat.id].nomeCategoria += "/" + nomeChild;
              component.fsmData[msg.message.chat.id].step = 23;
              await component.bot.editMessageText("🤑 Guadagno\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto?" , {
                chat_id: msg.message.chat.id,
                message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
                reply_markup: { 
                  inline_keyboard,
                },
              });
            });
          });
        break;
      
        case 23:
          await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){
            let nomeConto;

            for(let i = 0; i < conti.length; i++){
              if(conti[i].idConto == msg.data){
                nomeConto = conti[i].nome;
                break;
              }
            }

            let inline_keyboard = [];
            inline_keyboard[0] = [];
            inline_keyboard[0][0] = { text: "Fatto ", callback_data: "-1" };

            component.fsmData[msg.message.chat.id].idConto = parseInt(msg.data);
            component.fsmData[msg.message.chat.id].nomeConto = nomeConto;
            component.fsmData[msg.message.chat.id].step = 24;
            await component.bot.editMessageText("🤑 Guadagno\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto: " + nomeConto + "\nDescrizione?", {
              chat_id: msg.message.chat.id,
              message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
              reply_markup: { 
                  inline_keyboard,
                },
            });
          });
        break;
      
        case 24:
          await component.database.insertTransazioneNow(component.fsmData[msg.message.chat.id].importo, component.fsmData[msg.message.chat.id].idCategoriaChild, component.fsmData[msg.message.chat.id].idConto, null, " ", " ", async function (result){
            component.fsmData[msg.message.chat.id].step = 0;
            await component.bot.editMessageText("🤑 Guadagno\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nCategoria: " + component.fsmData[msg.message.chat.id].nomeCategoria + "\nConto: " + component.fsmData[msg.message.chat.id].nomeConto + "\nDescrizione: \nId: " + result.insertId + "\nSalvato!", {
              chat_id: msg.message.chat.id,
              message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
            });
          });
        break;
      
        case 31:
          await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){ 
            let nomeConto;

            for(let i = 0; i < conti.length; i++){
              if(conti[i].idConto == msg.data){
                nomeConto = conti[i].nome;
                break;
              }
            }

            let inline_keyboard = [];
            for(let i = 0; i < conti.length; i++){
              if(i % 3 == 0){
                inline_keyboard[i/3] = [];
              }
              inline_keyboard[parseInt(i/3)][parseInt(i%3)] = { text: conti[i].nome, callback_data: conti[i].idConto };
            }

            component.fsmData[msg.message.chat.id].idContoFrom = parseInt(msg.data);
            component.fsmData[msg.message.chat.id].nomeContoFrom = nomeConto;
            component.fsmData[msg.message.chat.id].step = 32;
            await component.bot.editMessageText("➡️ Trasferimento\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nConto from: " + nomeConto + "\nConto to?" , {
              chat_id: msg.message.chat.id,
              message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
              reply_markup: { 
                inline_keyboard,
              },
            });
          });
        break;
      
        case 32:
          await component.database.executeQueryFromFile('./queries/selectAll/conti.sql', {}, async function(conti){
            let nomeConto;

            for(let i = 0; i < conti.length; i++){
              if(conti[i].idConto == msg.data){
                nomeConto = conti[i].nome;
                break;
              }
            }

            let inline_keyboard = [];
            inline_keyboard[0] = [];
            inline_keyboard[0][0] = { text: "Fatto ", callback_data: "-1" };

            component.fsmData[msg.message.chat.id].idContoTo = parseInt(msg.data);
            component.fsmData[msg.message.chat.id].nomeContoTo = nomeConto;
            component.fsmData[msg.message.chat.id].step = 33;
            await component.bot.editMessageText("➡️ Trasferimento\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nConto from: " + component.fsmData[msg.message.chat.id].nomeContoFrom + "\nConto to: " + nomeConto + "\nDescrizione?" , {
              chat_id: msg.message.chat.id,
              message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
              reply_markup: { 
                inline_keyboard,
              },
            });
          });
        break;
      
        case 33:
          await component.database.insertTransazioneNow(component.fsmData[msg.message.chat.id].importo, null, component.fsmData[msg.message.chat.id].idContoFrom, component.fsmData[msg.message.chat.id].idContoTo, " ", " ", async function (result){
            component.fsmData[msg.message.chat.id].step = 0;
            await component.bot.editMessageText("➡️ Trasferimento\nImporto: " + component.fsmData[msg.message.chat.id].importo + "€\nConto from: " + component.fsmData[msg.message.chat.id].nomeContoFrom + "\nConto to: " + component.fsmData[msg.message.chat.id].nomeContoTo + "\nDescrizione:\nId: " + result.insertId + "\nSalvato!", {
              chat_id: msg.message.chat.id,
              message_id: component.fsmData[msg.message.chat.id].lastMessage.message_id,
            });
          });
        break;
      }
    });
  }

  async sendInitialMessage(id){
    this.fsmData[id] = { step: 0 };

    await this.bot.sendMessage(id, "Benvenuto!", {
      reply_markup: JSON.stringify({
        keyboard: [
          ['Spesa', 'Guadagno', 'Trasferimento'],
          ['Agg. Conto'],
          ['Bilancio']
        ]
      })
    });
  }

  async sendMessage(id, message, opts = null){
    if(opts == null)
      return await this.bot.sendMessage(id, message);
    else 
      return await this.bot.sendMessage(id, message, opts);
  }
}

module.exports = TelegramModule;