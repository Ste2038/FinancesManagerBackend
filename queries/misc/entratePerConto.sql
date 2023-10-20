SELECT SUM(T.importo) AS 'entrate', T.idContoFrom 
FROM Transazioni AS T, Categorie AS C 
WHERE T.idCategoria = C.idCategoria 
AND C.isEntrata = 1 AND C.isUscita = 0
AND T.isDeleted = 0 AND C.isDeleted = 0 
GROUP BY T.idContoFrom 
ORDER BY T.idContoFrom ASC;
