SELECT * 
FROM Ricorrenti AS R, Categorie AS C
WHERE R.idCategoria = C.idCategoria
AND R.isDeleted = 0 AND C.isDeleted = 0;