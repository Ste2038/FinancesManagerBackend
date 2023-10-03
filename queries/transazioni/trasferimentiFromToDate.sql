SELECT *
FROM Transazioni
WHERE idContoTo IS NOT NULL AND idContoFrom IS NOT NULL AND dateTime >= "${dateTimeStart}" AND dateTime < "${dateTimeEnd}"
AND isDeleted = 0
ORDER BY dateTime ASC;