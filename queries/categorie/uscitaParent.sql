SELECT * 
FROM Categorie 
WHERE idCategoriaParent IS NULL AND isUscita = 1 
AND isDeleted = 0;