SELECT SUM(importo) AS 'transazioniUscita', idContoFrom 
FROM Transazioni 
WHERE idContoTo IS NOT NULL AND idContoFrom IS NOT NULL 
AND isDeleted = 0 
GROUP BY idContoFrom 
ORDER BY idContoFrom ASC;