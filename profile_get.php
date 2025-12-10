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


$stmt = $conn->prepare("SELECT name, email, phone, address,course, profile_pic_path FROM users WHERE id = ?");

if ($stmt) {
    $stmt->bind_param("i", $user_id); 
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $data = $row;
    } else {
        $data = ["error" => "User data not found"];
    }
    
    $stmt->close();
} else {
    $data = ["error" => "Database error: " . $conn->error];
}

$conn->close();
echo json_encode($data);
?>