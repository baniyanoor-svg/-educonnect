<?php

session_start();
include "config.php"; 

header('Content-Type: application/json');



if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Authentication required"]);
    exit;
}

$data = [];



$stmt = $conn->prepare("SELECT id, title, content, date FROM notices WHERE status = 'Active' ORDER BY date DESC");

if ($stmt) {
 
    $stmt->execute();
    $result = $stmt->get_result();


    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $stmt->close();
}

$conn->close();

echo json_encode($data);
?>