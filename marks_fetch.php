<?php

session_start();
include "config.php"; 

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    
    echo json_encode(["error" => "Authentication required"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = [];


$stmt = $conn->prepare("SELECT subject, midterm, final, total FROM marks WHERE user_id = ?");

if ($stmt) {
    $stmt->bind_param("i", $user_id); 
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        
        $total_possible = 200; 
        
    
        $row['percentage'] = round(($row['total'] / $total_possible) * 100);
        $data[] = $row;
    }
    $stmt->close();
}

$conn->close();


echo json_encode($data);
?>