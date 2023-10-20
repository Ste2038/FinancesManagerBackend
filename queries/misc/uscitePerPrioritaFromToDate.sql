SELECT SUM(T.importo), C.priorita
FROM Transazioni AS T, Categorie AS C
WHERE T.idCategoria = C.idCategoria AND C.isUscita = 1 AND C.isEntrata = 0 AND T.dateTime >= '${dateTimeStart}' AND T.dateTime <= '${dateTimeEnd}'
AND T.isDeleted = 0 AND C.isDeleted = 0
GROUP BY priorita