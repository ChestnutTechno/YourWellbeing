<?php
// SQL Server Extension Sample Code:
$conn = new mysqli("your-wellbeing.mysql.database.azure.com", "genered@your-wellbeing", "TA38_yourwellbeing", "ywbdb");
if($conn->connect_error) {
    exit('Could not connect');
}

$sql = "SELECT food_id, food_name FROM ywbdb.food";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo $row["food_name"] . "|";
    }
}

?>