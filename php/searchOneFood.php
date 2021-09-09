<?php


// SQL Server Extension Sample Code:
$conn = new mysqli("your-wellbeing.mysql.database.azure.com", "genered@your-wellbeing", "TA38_yourwellbeing", "ywbdb");
if($conn->connect_error) {
    exit('Could not connect');
}
$str = $_GET['n'];
$sql = "SELECT food_name, energy_with_fiber, protein, fat, carbs FROM ywbdb.food WHERE food_name like '".$str."%'";
$result = $conn->prepare($sql);
$result->execute();
$result->store_result();
$result->bind_result($name, $energy, $protein, $fat, $carbs);
$result->fetch();
$result->close();

$amount = (int) $_REQUEST["a"];
$multiplier = (double) ($amount / 100);
$energy = $energy * $multiplier;


//echo "<tr>";
//echo "<td>" . $name . "</td>";
//echo "<td>" . $amount . " g</td>";
//echo "<td>" . $energy . " KJ</td>";
//echo "<td>";
//echo '<i class="fa fa-trash-o" aria-hidden="true"></i></td></tr>';

echo $name . "|" .
    $amount . "|" .
    round($energy, 2, PHP_ROUND_HALF_UP) . "|" .
    round($protein, 2, PHP_ROUND_HALF_UP) . "|" .
    round($fat, 2, PHP_ROUND_HALF_UP) . "|" .
    round($carbs, 2, PHP_ROUND_HALF_UP);

?>