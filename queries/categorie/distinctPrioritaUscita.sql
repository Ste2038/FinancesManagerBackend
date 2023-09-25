SELECT DISTINCT priorita 
FROM Categorie 
WHERE isUscita = 1 AND priorita IS NOT NULL 
AND isDeleted = 0 
ORDER BY priorita ASC;