SELECT *
FROM Transazioni
WHERE idContoTo IS NOT NULL AND idContoFrom IS NOT NULL
AND isDeleted = 0
ORDER BY dateTime ASC;