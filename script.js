
const API = "http://localhost/educonnect-backend/";



let userEmail = localStorage.getItem("userEmail");


// 1. LOGIN

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


// 2. REGISTRATION

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
        console.log("Server Response:", data);

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

// 3. PROFILE MODULE (FETCH AND UPDATE)


// --- A. FETCH PROFILE DATA 
function loadProfile() {
    // Check if the API constant is defined
    if (typeof API === 'undefined') {
        console.error("API constant is not defined!");
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
            
            // Fill the form fields
            document.getElementById('name').value = data.name || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('address').value = data.address || '';
            document.getElementById('course').value = data.course || 'Not Assigned'; 

            
          
            const profilePic = document.getElementById('current-profile-pic');
            if (profilePic && data.profile_pic_path) {
             
                profilePic.src = API + data.profile_pic_path;
            } else if (profilePic) {
                // Fallback to a default image if no path is stored
                profilePic.src = 'default_profile.jpeg'; 
            }
            
            console.log("Profile data loaded successfully.");

        })
        .catch(error => {
            console.error('Error fetching profile:', error);
          
        });
}


// --- B. UPDATE PROFILE DATA (Runs on form submission) 
async function updateProfile(event) {
    event.preventDefault(); // Stop the default form submission
    
    const form = document.getElementById('profile-form');
    // Create FormData object, which correctly handles files (profile_pic) and text fields
    const formData = new FormData(form); 

    try {
        const response = await fetch(API + "profile_update.php", {
            method: 'POST',
            body: formData // Pass the FormData object directly
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();

        if (data.success) {
            alert("Profile updated successfully!");
            
            // If a new picture was uploaded, update the image source immediately
            if (data.new_path) {
                 document.getElementById('current-profile-pic').src = API + data.new_path;
            }
            
            // Revert to view mode after successful save
            toggleEditMode(false); 
        } else {
            alert("Update failed: " + data.message);
        }

    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred during profile update.');
    }
}

// --- 4. PROFILE PAGE LOGIC (EDIT MODE AND LISTENERS) ---
if (path.includes('profile.html')) {
    
    // Call the function to load the profile data when the page loads
    if (typeof loadProfile === 'function') {
        loadProfile(); 
    }

    const profileForm = document.getElementById('profile-form'); 
    const editButton = document.getElementById('edit-button'); 
    const saveButton = document.getElementById('save-button');

    if (profileForm && editButton && saveButton) {

        // Function to toggle edit mode (copied from your original logic)
        const toggleEditMode = (isEditing) => {
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const addressTextarea = document.getElementById('address');
            const changePicButton = document.getElementById('change-pic-button');

            // Toggle element visibility
            editButton.style.display = isEditing ? 'none' : 'block';
            saveButton.style.display = isEditing ? 'block' : 'none';
            changePicButton.style.display = isEditing ? 'block' : 'none'; // Assuming changePicButton exists

            // Toggle readonly status
            const setReadonly = !isEditing;
            [nameInput, emailInput, phoneInput, addressTextarea].forEach(field => {
                if (field) {
                    field.readOnly = setReadonly; // Use .readOnly property for simplicity
                }
            });
        };

        // --- Event Listener for the EDIT button ---
        editButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            toggleEditMode(true); 
            document.getElementById('name').focus();
        });

        // --- Event Listener for the SAVE CHANGES button (Form Submission) ---
        profileForm.addEventListener('submit', (event) => {
            event.preventDefault(); 
            
            // Call your update function to save data
            if (typeof updateProfile === 'function') {
                updateProfile(event);
            } else {
                // Fallback: If updateProfile is missing, just revert the view
                toggleEditMode(false); 
            }
        });

        // Initialize the page view
        toggleEditMode(false); 
    }
}


    

// 5. FETCH ATTENDANCE

function fetchAttendanceData() {
    // Check if user is logged in before fetching
    if (!userEmail) {
        console.warn("User email not found. Cannot fetch attendance.");
        return;
    }

    // *** FIX: Changed relative path to absolute path using the API constant ***
    // This solves the 404 Not Found error for attendance_fetch.php
    fetch(API + 'attendance_fetch.php') 
        .then(response => {
            if (!response.ok) {
                // If status is 404, 500, etc.
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#attendance-table-body');
            // Clear existing rows before appending
            if (tableBody) tableBody.innerHTML = ''; 
            
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
            // Alert user about the failure
            alert('Failed to load attendance data. Please check the network path or server console.');
        });
}



// 6. FETCH MARKS (COMPLETE IMPLEMENTATION)

function loadMarks() {
    // Check if user is logged in before fetching (uses the userEmail variable you defined elsewhere)
    if (!userEmail) {
        console.warn("User email not found. Cannot fetch marks.");
        return;
    }

    // Use the absolute path to marks_fetch.php
    fetch(API + "marks_fetch.php")
        .then(response => {
            // Check for network errors (404, 500)
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Check for authentication error returned by PHP
            if (data.error) {
                console.warn('Authentication failed for marks data:', data.error);
                return; 
            }
            
            // Target the table body ID from marks.html
            const tableBody = document.querySelector('#marks-table-body');
            if (!tableBody) return; 
            
            tableBody.innerHTML = ''; // Clear any existing rows
            
            // Loop through the array of marks records
            data.forEach(record => {
                const row = tableBody.insertRow();
                
                // Ensure the cell insertion order matches the HTML <th> tags:
                // Subject | Midterm | Final | Total | Percentage
                row.insertCell().textContent = record.subject;
                row.insertCell().textContent = record.midterm;
                row.insertCell().textContent = record.final;
                row.insertCell().textContent = record.total;
                // Use the percentage calculated by marks_fetch.php
                row.insertCell().textContent = `${record.percentage}%`; 
            });
        })
        .catch(error => {
            console.error('Error fetching marks:', error);
            // Alert user about the failure
            alert('Failed to load marks data. Please check the network path or server console.');
        });
}

//6.FETCH NOTICES
function loadNotices() {
    // Check if user is logged in before fetching
    if (!userEmail) return;

    fetch(API + "notices_fetch.php")
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch notices.');
            }
            return response.json();
        })
        .then(data => {
            // Assuming your notices display area has the ID 'notice-area'
            const noticeArea = document.querySelector('#notice-area');
            if (!noticeArea) return; 
            
            noticeArea.innerHTML = ''; // Clear existing content
            
            data.forEach(notice => {
                // Create a div or card for each notice
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

            if (data.length === 0) {
                noticeArea.innerHTML = '<p>No active announcements found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching notices:', error);
            alert('Failed to load notices data.');
        });
}



//contact page
async function sendMessage(event) {
    event.preventDefault(); // Prevents page reload

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

        // The PHP returns plain text ("success" or "failed")
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



// 8. AUTO-LOAD REQUIRED DATA ON PAGE OPEN 




document.addEventListener('DOMContentLoaded', function() {

    // --- Profile page ---
   
    if (document.body.contains(document.querySelector("#p-name"))) {
      
        // loadProfile(); 
    }

    // --- Attendance page ---
  .
    if (document.body.contains(document.querySelector("#attendance-table-body"))) {
        fetchAttendanceData(); // Calling the correctly named function
    }

    // --- Marks page ---
    if (document.body.contains(document.querySelector("#marks-table-body"))) {
        loadMarks();
    }

    // --- Notices page ---
    if (document.body.contains(document.querySelector("#notice-area"))) {
        loadNotices();
    }

});


// GLOBAL PAGE LOAD INITIATOR (FINAL VERSION)

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    // 1. Attendance Page Check
    if (path.includes('attendance.html')) {
        fetchAttendanceData(); 
    }
    
    // 2. Marks Page Check
    if (path.includes('marks.html')) {
        loadMarks();
    }
    
    // 3. Notices Page Check
    if (path.includes('notices.html')) {
        loadNotices();
    }
    
    // 4. Profile Page Check (NEW)
    if (path.includes('profile.html')) {
        loadProfile(); 
    }
    

    // --- 1. Event Listeners for Edit/Save Buttons ---
    const editButton = document.getElementById('edit-button'); 
    const saveButton = document.getElementById('save-button');
    const profileForm = document.getElementById('profile-form'); 
    
    
    if (editButton && saveButton && profileForm && typeof toggleEditMode === 'function') {
        
        // Listener for the EDIT button click
        editButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            // Call the existing function to switch to edit mode
            toggleEditMode(true); 
          
            const nameField = document.getElementById('name');
            if (nameField) {
                nameField.focus();
            }
        });

        // Listener for the SAVE CHANGES button (Form Submission)
        profileForm.addEventListener('submit', (event) => {
            // Stop the default form submission for now
            event.preventDefault(); 
            
          
            if (typeof updateProfile === 'function') {
                updateProfile(event);
            } else {
                // If updateProfile is not defined, just revert the view
                toggleEditMode(false); 
            }
        });

        // Initialize the profile page to read-only mode when it loads
        toggleEditMode(false); 
    }
   
    
});
