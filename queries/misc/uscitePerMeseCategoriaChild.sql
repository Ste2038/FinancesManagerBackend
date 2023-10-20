SELECT C.nome AS 'nome', SUM(T.importo) AS 'importo', MONTH(T.DATETIME) AS 'mese', C.idCategoriaParent, C.idCategoria AS 'idCategoria'
FROM Transazioni AS T, Categorie AS C
WHERE T.idCategoria = C.idCategoria 
AND YEAR(T.DATETIME) = ${anno} AND T.idCategoria IS NOT NULL AND C.isUscita = 1 AND C.isEntrata = 0 AND C.idCategoriaParent = ${idParent} 
AND T.isDeleted = 0 AND C.isDeleted = 0
GROUP BY T.idCategoria, YEAR(T.DATETIME), MONTH(T.DATETIME)
ORDER BY MONTH(T.DATETIME) ASC, C.nome ASC;