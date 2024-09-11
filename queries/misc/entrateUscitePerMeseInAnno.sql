SELECT E.mese AS 'mese', E.importo AS 'entrata', U.importo AS 'uscita', (E.importo - U.importo) AS 'totale'
FROM (
  SELECT mese, SUM(importo)AS 'importo'
  FROM (
    SELECT Month(T.dateTime) AS 'mese', SUM(T.importo) AS 'importo'
    FROM Categorie AS C, Transazioni AS T
    WHERE C.idCategoria = T.idCategoria AND YEAR(T.dateTime) = 2023 AND C.isEntrata = 1
    GROUP BY MONTH(T.dateTime)
    UNION
    SELECT Num AS 'mese', Zero AS 'importo'
    FROM (
      SELECT 1 As Num
      UNION ALL Select 2
      UNION ALL Select 3
      UNION ALL Select 4
      UNION ALL Select 5
      UNION ALL Select 6
      UNION ALL Select 7
      UNION ALL Select 8          
      UNION ALL Select 9
      UNION ALL Select 10
      UNION ALL SELECT 11
      UNION ALL SELECT 12
    ) AS N, (SELECT 0 AS 'zero') AS Z
  ) AS A
  GROUP BY mese) AS E, (
    SELECT mese, SUM(importo)AS 'importo'
    FROM (
      SELECT Month(T.dateTime) AS 'mese', SUM(T.importo) AS 'importo'
      FROM Categorie AS C, Transazioni AS T
      WHERE C.idCategoria = T.idCategoria AND YEAR(T.dateTime) = 2023 AND C.isEntrata = 0
      GROUP BY MONTH(T.dateTime)
      UNION
      SELECT Num AS 'mese', Zero AS 'importo'
      FROM (
        SELECT 1 As Num
        UNION ALL Select 2
        UNION ALL Select 3
        UNION ALL Select 4
        UNION ALL Select 5
        UNION ALL Select 6
        UNION ALL Select 7
        UNION ALL Select 8          
        UNION ALL Select 9
        UNION ALL Select 10
        UNION ALL SELECT 11
        UNION ALL SELECT 12
      ) AS N, (SELECT 0 AS 'zero') AS Z
    ) AS A
    GROUP BY mese
  ) AS U
WHERE E.mese = U.mese
ORDER BY E.mese ASC

