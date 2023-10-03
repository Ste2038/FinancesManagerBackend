SELECT * 
FROM Categorie 
WHERE idCategoriaParent = ${idParent} AND isUscita = 1 
AND isDeleted = 0;