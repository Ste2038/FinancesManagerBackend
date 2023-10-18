SELECT SUM(T.importo)
FROM Transazioni AS T, Categorie AS C
WHERE T.idCategoria = C.idCategoria AND isEntrata = 1 AND T.dateTime >= '${dateTimeStart}' AND T.dateTime <= '${dateTimeEnd}'
AND T.isDeleted = 0 AND C.isDeleted = 0