SELECT * 
FROM Categorie 
WHERE idCategoriaParent IS NULL AND isEntrata = 1 
AND isDeleted = 0;