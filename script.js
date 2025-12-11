
// =================================================================
// EDUCONNECT STUDENT PORTAL - script.js
// =================================================================

// BACKEND URL (CRITICAL: Change this for hosting)
const API = "http://localhost/educonnect-backend/"; 

// Global variable to store logged-in user email
let userEmail = localStorage.getItem("userEmail");


// =============================================
// I. AUTHENTICATION (LOGIN & REGISTER)
// =============================================

async function loginUser(event) {
    event.preventDefault();

    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-pass").value;

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const res = await fetch(API + "login.php", {
        method: "POST",
        body: formData
    });

    const data = await res.text();

    if (data.trim() === "success") {
        localStorage.setItem("userEmail", email);
        window.location.href = "dashboard.html";
    } else {
        alert("Login failed! Incorrect email or password.");
    }
}

async function registerUser(event) {
    event.preventDefault();

    const name = document.querySelector("#reg-name").value.trim();
    const email = document.querySelector("#reg-email").value.trim();
    const password = document.querySelector("#reg-pass").value.trim();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
        const res = await fetch(API + "register.php", {
            method: "POST",
            body: formData
        });

        const data = await res.text();

        if (data.trim() === "success") {
            alert("Account created successfully!");
            window.location.href = "login.html";
        } 
        else if (data.trim() === "exists") {
            alert("Email already exists, try another.");
        } 
        else {
            alert("Registration failed. Server error.");
        }

    } catch (err) {
        console.error("Error:", err);
        alert("Network error occurred.");
    }
}


// =============================================
// II. PROFILE MODULE (FETCH, UPDATE, AND EDIT MODE)
// =============================================

// --- A. TOGGLE EDIT MODE (MADE GLOBAL TO PREVENT ReferenceError) ---
// This function must be defined outside the DOMContentLoaded listener.
function toggleEditMode(isEditing) {
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const changePicButton = document.getElementById('change-pic-button');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressTextarea = document.getElementById('address');
    const courseInput = document.getElementById('course'); // Added course input

    if (!editButton || !saveButton) return;

    // Toggle element visibility
    editButton.style.display = isEditing ? 'none' : 'block';
    saveButton.style.display = isEditing ? 'block' : 'none';
    if (changePicButton) changePicButton.style.display = isEditing ? 'block' : 'none';

    // Toggle readonly status
    const setReadonly = !isEditing;
    [nameInput, phoneInput, addressTextarea, courseInput].forEach(field => {
        if (field) {
            field.readOnly = setReadonly;
        }
    });

    // Email is usually kept read-only for security
    if (emailInput) emailInput.readOnly = true; 
}


// --- B. FETCH PROFILE DATA (Runs on profile.html load) ---
function loadProfile() {
    if (!userEmail) {
        console.warn("User not logged in. Cannot load profile.");
        return;
    }

    fetch(API + "profile_get.php")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.warn('Profile data failed to load:', data.error);
                return;
            }
            
            // Fill the form fields (FIX: Added default empty string || '' for blank fields)
            document.getElementById('name').value = data.name || '';
            document.getElementById('email').value = data.email || userEmail;
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('address').value = data.address || '';
            document.getElementById('course').value = data.course || 'Not Assigned'; //

            
            // Update the profile picture source
            const profilePic = document.getElementById('current-profile-pic');
            if (profilePic && data.profile_pic_path) {
                profilePic.src = API + data.profile_pic_path;
            } else if (profilePic) {
                profilePic.src = 'default_profile.jpeg'; // Fallback image
            }
            
            console.log("Profile data loaded successfully.");
            toggleEditMode(false); // Ensure view mode is set after loading
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            alert('Failed to load profile data. Check server logs.');
        });
}


// --- C. UPDATE PROFILE DATA (Runs on form submission) ---
async function updateProfile(event) {
    event.preventDefault(); 
    
    const form = document.getElementById('profile-form');
    const formData = new FormData(form); 

    try {
        const response = await fetch(API + "profile_update.php", {
            method: 'POST',
            body: formData 
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();

        if (data.success) {
            alert("Profile updated successfully!");
            
            if (data.new_path) {
                 document.getElementById('current-profile-pic').src = API + data.new_path;
            }
            
            toggleEditMode(false); 
        } else {
            alert("Update failed: " + data.message);
        }

    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred during profile update.');
    }
}


// =============================================
// III. DATA FETCHING MODULES
// =============================================

// --- A. FETCH ATTENDANCE ---
function fetchAttendanceData() {
    if (!userEmail) return;

    fetch(API + 'attendance_fetch.php') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#attendance-table-body');
            if (!tableBody) return;
            tableBody.innerHTML = ''; 
            
            if (data.error) {
                tableBody.innerHTML = `<tr><td colspan="4">${data.error}</td></tr>`;
                return;
            }

            data.forEach(record => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = record.subject;
                row.insertCell().textContent = record.total_classes;
                row.insertCell().textContent = record.attended;
                row.insertCell().textContent = `${record.percentage}%`; 
            });
        })
        .catch(error => {
            console.error('Error fetching attendance:', error);
            alert('Failed to load attendance data. Please check server logs.');
        });
}


// --- B. FETCH MARKS ---
function loadMarks() {
    if (!userEmail) return;

    fetch(API + "marks_fetch.php")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#marks-table-body');
            if (!tableBody) return; 
            tableBody.innerHTML = '';
            
            if (data.error) {
                tableBody.innerHTML = `<tr><td colspan="5">${data.error}</td></tr>`;
                return;
            }

            data.forEach(record => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = record.subject;
                row.insertCell().textContent = record.midterm;
                row.insertCell().textContent = record.final;
                row.insertCell().textContent = record.total;
                row.insertCell().textContent = `${record.percentage}%`; 
            });
        })
        .catch(error => {
            console.error('Error fetching marks:', error);
            alert('Failed to load marks data. Please check server logs.');
        });
}


// --- C. FETCH NOTICES ---
function loadNotices() {
    if (!userEmail) return;

    fetch(API + "notices_fetch.php")
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch notices.');
            }
            return response.json();
        })
        .then(data => {
            const noticeArea = document.querySelector('#notice-area');
            if (!noticeArea) return; 
            noticeArea.innerHTML = ''; 
            
            if (data.error) {
                 noticeArea.innerHTML = `<p class="alert alert-danger">${data.error}</p>`;
                 return;
            }

            if (data.length === 0) {
                noticeArea.innerHTML = '<p>No active announcements found.</p>';
                return;
            }
            
            data.forEach(notice => {
                const noticeHtml = `
                    <div class="notice-card">
                        <h3>${notice.title}</h3>
                        <p class="notice-date">Posted: ${notice.date}</p>
                        <p>${notice.content}</p>
                        <hr>
                    </div>
                `;
                noticeArea.innerHTML += noticeHtml;
            });
        })
        .catch(error => {
            console.error('Error fetching notices:', error);
            alert('Failed to load notices data.');
        });
}


// --- D. CONTACT FORM SUBMIT ---
async function sendMessage(event) {
    event.preventDefault(); 

    const name = document.querySelector("#c-name").value;
    const email = document.querySelector("#c-email").value;
    const msg = document.querySelector("#c-msg").value;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', msg);
    
    try {
        const response = await fetch(API + "contact_submit.php", {
            method: 'POST',
            body: formData
        });

        const data = await response.text(); 
        
        if (data.trim() === "success") {
            alert("Message sent successfully!");
            // Clear the form after successful submission
            document.querySelector("#c-name").value = "";
            document.querySelector("#c-email").value = "";
            document.querySelector("#c-msg").value = "";
        } else {
            alert("Failed to send message. Please try again.");
        }
    } catch (error) {
        console.error('Network or system error:', error);
        alert("An error occurred. Check the console.");
    }
}


// =============================================
// IV. GLOBAL PAGE LOAD INITIATOR (FINAL VERSION)
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // **CRITICAL FIX:** This path variable is local to this function, fixing the ReferenceError
    const path = window.location.pathname; 

    // --- Data Fetching Checks ---
    if (path.includes('attendance.html')) {
        fetchAttendanceData(); 
    }
    
    if (path.includes('marks.html')) {
        loadMarks();
    }
    
    if (path.includes('notices.html')) {
        loadNotices();
    }
    
    // --- Profile Page Checks ---
    if (path.includes('profile.html')) {
        loadProfile(); 

        const profileForm = document.getElementById('profile-form'); 
        const editButton = document.getElementById('edit-button'); 
        const saveButton = document.getElementById('save-button');
        
        // Listeners are attached here, using the globally defined toggleEditMode
        if (profileForm && editButton && saveButton) {
            editButton.addEventListener('click', (event) => {
                event.preventDefault(); 
                toggleEditMode(true); 
                document.getElementById('name').focus();
            });

            profileForm.addEventListener('submit', (event) => {
                event.preventDefault(); 
                updateProfile(event);
            });
        }
    }
    
    // Check if user is on the dashboard and display welcome
    if (path.includes('dashboard.html') && userEmail) {
        // You might want to grab the user's name from localStorage or a quick fetch here
        const userName = userEmail.split('@')[0];
        const welcomeElement = document.getElementById('welcome-message'); // Assume dashboard has this ID
        if (welcomeElement) {
             welcomeElement.textContent = `Welcome, ${userName}`;
        }
    }

});