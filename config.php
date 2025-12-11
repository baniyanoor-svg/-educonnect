<?php
// ===============================
// DATABASE CONFIGURATION
// ===============================

// Database host (usually localhost)
$host = "localhost";

// Database username
$username = "root";

// Database password (keep empty if you haven’t set any)
$password = "";

// Database name
$database = "educonnect"; // change this to your actual DB name

// ===============================
// DATABASE CONNECTION
// ===============================

// Create connection
$conn = mysqli_connect($host, $username, $password, $database);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Optional: Set character encoding
mysqli_set_charset($conn, "utf8");


?>
