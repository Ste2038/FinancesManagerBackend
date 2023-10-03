SELECT SUM(importo) AS 'transazioniEntrata', idContoTo
FROM Transazioni
WHERE idContoTo IS NOT NULL AND idContoFrom IS NOT NULL AND dateTime < "${dateTimeEnd}"
AND isDeleted = 0
GROUP BY idContoTo
ORDER BY idContoTo ASC;