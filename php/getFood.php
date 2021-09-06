<?php
// SQL Server Extension Sample Code:
$connectionInfo = array("UID" => "genered", "pwd" => "TA38_yourwellbeing", "Database" => "genered_db", "LoginTimeout" => 30, "Encrypt" => 1, "TrustServerCertificate" => 0);
$serverName = "tcp:yw-db.database.windows.net,1433";
$conn = sqlsrv_connect($serverName, $connectionInfo);
    $tsql= "SELECT TOP 20 f.food_name FROM [dbo].[Food] f";
    $getResults= sqlsrv_query($conn, $tsql);
    echo ("Reading data from table" . PHP_EOL);
    if ($getResults == FALSE)
        echo (sqlsrv_errors());
    while ($row = sqlsrv_fetch_array($getResults, SQLSRV_FETCH_ASSOC)) {
     echo ($row['food_name'] . PHP_EOL);
    }
    sqlsrv_free_stmt($getResults);
?>