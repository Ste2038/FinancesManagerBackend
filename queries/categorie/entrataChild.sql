SELECT * 
FROM Categorie 
WHERE idCategoriaParent = ${idParent} AND isEntrata = 1 
AND isDeleted = 0;