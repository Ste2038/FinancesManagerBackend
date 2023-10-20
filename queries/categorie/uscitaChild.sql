SELECT * 
FROM Categorie 
WHERE idCategoriaParent = ${idParent} AND isUscita = 1 AND isEntrata = 0
AND isDeleted = 0;