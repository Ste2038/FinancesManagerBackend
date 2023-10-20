SELECT SUM(importo) AS 'uscite', idContoFrom 
FROM Transazioni AS T, Categorie AS C 
WHERE T.idCategoria = C.idCategoria 
AND C.isUscita = 1 AND C.isEntrata = 0
AND T.isDeleted = 0 AND C.isDeleted = 0 
GROUP BY idContoFrom 
ORDER BY idContoFrom ASC;
