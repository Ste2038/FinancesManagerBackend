const express = require('express');

function createRouter(database) {
  const router = express.Router();
  const owner = '';

  // the routes are defined here

  router.get('/conti', function (req, res, next) {
    database.executeQueryFromFile('./queries/selectAll/conti.sql', function(result){
      if(result.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        res.status(200).json(result);
      }
    });
  });

  router.post('/transazioni', function (req, res, next) {
    console.log("/transazioni");
    database.getTransazioni(req.body.queryResult.priorita, req.body.queryResult.dataFrom, req.body.queryResult.dataTo, function(transazioni){
      if(transazioni.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        database.selectCategorieUscitaParent(function (categorie){
          if(categorie.status == 'error'){
            res.status(500).json({status: 'error'});
          }
          else{
            for(let i = 0; i < transazioni.length; i++){
              if(transazioni[i].idCategoriaParent != null){
                for(let j = 0; j < categorie.length; j++){
                  if (categorie[j].idCategoria == transazioni[i].idCategoriaParent){
                    transazioni[i].nome = categorie[j].nome + '/' + transazioni[i].nome;
                  }
                }
              }
            }
          
            res.status(200).json(transazioni);
          }
        });
      }
    });
  });

  router.get('/priorita', function (req, res, next) {
    database.executeQueryFromFile('./queries/categorie/distinctPrioritaUscita.sql', function(result){
      if(result.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        res.status(200).json(result);
      }
    });
  });

  router.get('/bilancio', function (req, res, next) {
    database.getBilancioPerConto("2023-12-31", function(bilancio){
      if(bilancio.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        res.status(200).json(bilancio);
      }
    })
  });

  router.get('/bilancio/annuo', function (req, res, next) {
    database.getBilancioPerContoAnnuoPerGiorno(2023, function(bilancio){
      if(bilancio.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        res.status(200).json(bilancio);
      }
    })
  });

  router.get('/bilancio/totale', function (req, res, next) {
    database.getBilancioPerConto("2022-12-31", function(bilancio){
      if(bilancio.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        res.status(200).json(bilancio[bilancio.length - 1]);
      }
    })
  });

  router.get('/categoriemensili', function (req, res, next) {
    let anno = 2023;
    if(req.query.parent == -1){
      database.getUsciteMensiliCategoriaParent(anno, function(bilancio){
        if(bilancio.status == 'error'){
          res.status(500).json({status: 'error'});
        }
        else{
          res.status(200).json(bilancio);
        }
      })
    }
    else{
      database.getUsciteMensiliCategoriaChild(anno, req.query.parent, function(bilancio){
        if(bilancio.status == 'error'){
          res.status(500).json({status: 'error'});
        }
        else{
          res.status(200).json(bilancio);
        }
      })
    }
  });  

  router.get('/futuro', function (req, res, next) {
    database.getMesiRimanenti(function(bilancio){
      if(bilancio.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        res.status(200).json(bilancio);
      }
    })
  });

  router.get('/categorieuscitaparent', function (req, res, next) {
    database.executeQueryFromFile('./queries/categorie/uscitaParent.sql', function(result){
      if(result.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        res.status(200).json(result);
      }
    });
  });

   /*router.get('/bilancio', function (req, res, next) {
    getBalance(function(balance){
      if(balance.status == 'error'){
        res.status(500).json({status: 'error'});
      }
      else{
        res.status(200).json(balance);
      }
    })
  });*/

  return router;
}

module.exports = createRouter;