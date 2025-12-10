<?php
// contact_submit.php
include "config.php"; 


header('Content-Type: text/plain'); 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "failed";
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');


if (empty($name) || empty($email) || empty($message)) {
    echo "failed"; 
    exit;
}


$sql = "INSERT INTO contact_messages (name, email, message, submission_date) VALUES (?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);

if ($stmt) {
  
    $stmt->bind_param("sss", $name, $email, $message);
    
    if ($stmt->execute()) {
        echo "success"; 
    } else {
       
        error_log("Contact form execution failed: " . $stmt->error);
        echo "failed";
    }
    $stmt->close();
} else {
   
    error_log("Contact form preparation failed: " . $conn->error);
    echo "failed";
}

$conn->close();
?>