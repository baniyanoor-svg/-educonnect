<?php

session_start();
include "config.php"; 

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Authentication required"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$upload_dir = 'uploads/profiles/'; 
$new_picture_path = null;


if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === UPLOAD_ERR_OK) {
    
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $file_tmp_path = $_FILES['profile_pic']['tmp_name'];
    $file_extension = strtolower(pathinfo($_FILES['profile_pic']['name'], PATHINFO_EXTENSION));
    
  
    $file_name = $user_id . '_' . time() . '.' . $file_extension;
    $dest_path = $upload_dir . $file_name;
    
    if (move_uploaded_file($file_tmp_path, $dest_path)) {
        $new_picture_path = $dest_path; 
    }
}


$phone = $_POST['phone'] ?? null;
$address = $_POST['address'] ?? null;


$update_fields = [];
$bind_params = [];
$bind_types = "";

if ($phone !== null) {
    $update_fields[] = "phone = ?";
    $bind_params[] = &$phone;
    $bind_types .= "s";
}
if ($address !== null) {
    $update_fields[] = "address = ?";
    $bind_params[] = &$address;
    $bind_types .= "s";
}
if ($new_picture_path !== null) {
    $update_fields[] = "profile_pic_path = ?";
    $bind_params[] = &$new_picture_path;
    $bind_types .= "s";
}

if (!empty($update_fields)) {
    $sql = "UPDATE users SET " . implode(", ", $update_fields) . " WHERE id = ?";
    
  
    $bind_params[] = &$user_id;
    $bind_types .= "i";

    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param($bind_types, ...$bind_params);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0 || $new_picture_path !== null) {
            echo json_encode(["success" => true, "message" => "Profile updated.", "new_path" => $new_picture_path]);
            exit;
        }
    }
} 

echo json_encode(["success" => false, "message" => "No changes made or update failed."]);
$conn->close();
?>