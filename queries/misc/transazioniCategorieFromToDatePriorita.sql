SELECT * 
FROM Transazioni AS T, Categorie AS C 
WHERE T.idCategoria = C.idCategoria 
AND C.priorita IN (${priorita}) AND T.dateTime >= "${dateTimeStart}" AND T.dateTime <= "${dateTimeEnd}"
AND T.isDeleted = 0 AND C.isDeleted = 0;
    