SELECT * 
FROM Categorie 
WHERE idCategoriaParent IS NULL AND isUscita = 1 AND isEntrata = 0
AND isDeleted = 0;