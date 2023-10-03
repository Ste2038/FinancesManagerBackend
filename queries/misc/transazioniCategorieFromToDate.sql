SELECT * 
FROM Transazioni AS T, Categorie AS C 
WHERE T.idCategoria = C.idCategoria 
AND T.dateTime >= "${dateTimeStart}" AND T.dateTime < "${dateTimeEnd}"
AND T.isDeleted = 0 AND C.isDeleted = 0 
ORDER BY T.dateTime ASC;