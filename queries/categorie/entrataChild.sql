SELECT * 
FROM Categorie 
WHERE idCategoriaParent = ${idParent} AND isEntrata = 1 AND isUscita = 0
AND isDeleted = 0;