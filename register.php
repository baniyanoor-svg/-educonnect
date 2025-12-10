<?php

include "config.php";



$name = isset($_POST["name"]) ? trim($_POST["name"]) : '';
$email = isset($_POST["email"]) ? trim($_POST["email"]) : '';
$password = isset($_POST["password"]) ? $_POST["password"] : '';

if (empty($name) || empty($email) || empty($password)) {
    echo "missing";
    exit;
}


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "error: invalid email format";
    exit;
}


$hashedPassword = password_hash($password, PASSWORD_DEFAULT);



$stmt_check = $conn->prepare("SELECT email FROM users WHERE email = ?");

if (!$stmt_check) {
 
    echo "error: " . $conn->error;
    exit;
}

$stmt_check->bind_param("s", $email);
$stmt_check->execute();
$stmt_check->store_result();

if ($stmt_check->num_rows > 0) {
    echo "exists";
    $stmt_check->close();
    exit;
}
$stmt_check->close();





$courseColumnCheck = mysqli_query($conn, "SHOW COLUMNS FROM users LIKE 'course'");
$hasCourseColumn = mysqli_num_rows($courseColumnCheck) > 0;

if ($hasCourseColumn) {
 
    $sql = "INSERT INTO users(name, email, password, course) VALUES(?, ?, ?, 'BTECH CSE')";
    $stmt_insert = $conn->prepare($sql);
    $stmt_insert->bind_param("sss", $name, $email, $hashedPassword);
} else {
  
    $sql = "INSERT INTO users(name, email, password) VALUES(?, ?, ?)";
    $stmt_insert = $conn->prepare($sql);
    $stmt_insert->bind_param("sss", $name, $email, $hashedPassword);
}


if ($stmt_insert->execute()) {
    echo "success";
} else {
   
    echo "error: " . $stmt_insert->error;
}

$stmt_insert->close();
$conn->close();
?>