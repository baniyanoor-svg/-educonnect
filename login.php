<?php

include "config.php";
$email = isset($_POST["email"]) ? trim($_POST["email"]) : '';
$password = isset($_POST["password"]) ? $_POST["password"] : '';

if (empty($email) || empty($password)) {
    echo "missing"; 
    exit;
}


$stmt = $conn->prepare("SELECT id, name, password FROM users WHERE email = ?");

if (!$stmt) {
    echo "error: " . $conn->error;
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();


if ($stmt->num_rows == 0) {
    echo "invalid"; 
    $stmt->close();
    exit;
}


$stmt->bind_result($user_id, $user_name, $hashed_password);
$stmt->fetch();
$stmt->close();


if (password_verify($password, $hashed_password)) {
    

    session_start();
    $_SESSION['user_id'] = $user_id;
    $_SESSION['user_name'] = $user_name;
    
    echo "success";
    
} else {

    echo "invalid";
}

$conn->close();
?>