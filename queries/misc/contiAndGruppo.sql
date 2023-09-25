SELECT C.idConto, C.nome AS 'conto', G.nome AS 'gruppoConto', C.valoreIniziale 
FROM Conti AS C, GruppiConto AS G 
WHERE C.idGruppoConto = G.idGruppoConto 
AND C.isDeleted = 0 AND G.isDeleted = 0 
ORDER BY C.idConto ASC;
