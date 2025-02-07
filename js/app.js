// Initialize local storage with default values if empty
if (!localStorage.getItem('subjects')) {
    localStorage.setItem('subjects', JSON.stringify([]));
}
if (!localStorage.getItem('schedule')) {
    const emptySchedule = {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
    };
    localStorage.setItem('schedule', JSON.stringify(emptySchedule));
}
if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify({}));
}

// Helper functions
function getSubjects() {
    return JSON.parse(localStorage.getItem('subjects'));
}

function getSchedule() {
    return JSON.parse(localStorage.getItem('schedule'));
}

function getAttendance() {
    return JSON.parse(localStorage.getItem('attendance'));
}

// Update the path checking logic for all pages
function isCurrentPage(pageName) {
    const path = window.location.pathname;
    // For local file access
    if (path.includes('\\') || path.includes('file://')) {
        return path.endsWith(pageName);
    }
    // For web server access
    return path.endsWith(pageName) || 
           path.includes(`/${pageName}`) ||
           (pageName === 'index.html' && 
            (path === '/' || path.endsWith('/')));
}

// Subjects page functionality
if (isCurrentPage('subjects.html')) {
    const addSubjectForm = document.getElementById('addSubjectForm');
    const subjectsList = document.getElementById('subjectsList');

    function displaySubjects() {
        const subjects = getSubjects();
        subjectsList.innerHTML = subjects.map(subject => `
            <div class="subject-item">
                <span>${subject}</span>
                <button onclick="deleteSubject('${subject}')">Delete</button>
            </div>
        `).join('');
    }

    addSubjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subjectName = document.getElementById('subjectName').value;
        const subjects = getSubjects();
        if (!subjects.includes(subjectName)) {
            subjects.push(subjectName);
            localStorage.setItem('subjects', JSON.stringify(subjects));
            displaySubjects();
            document.getElementById('subjectName').value = '';
        }
    });

    window.deleteSubject = function(subject) {
        const subjects = getSubjects();
        const newSubjects = subjects.filter(s => s !== subject);
        localStorage.setItem('subjects', JSON.stringify(newSubjects));
        displaySubjects();
    };

    displaySubjects();
}

// Schedule page functionality
if (isCurrentPage('schedule.html')) {
    const scheduleContainer = document.getElementById('scheduleContainer');
    const modal = document.getElementById('addClassModal');
    const addClassForm = document.getElementById('addClassForm');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let selectedDay = '';

    function displaySchedule() {
        const schedule = getSchedule();
        const subjects = getSubjects();
        
        if (!subjects || subjects.length === 0) {
            scheduleContainer.innerHTML = `
                <p>No subjects added yet. Please add subjects in the 
                    <a href="subjects.html">Manage Subjects</a> page first.</p>
            `;
            return;
        }
        
        scheduleContainer.innerHTML = days.map(day => `
            <div class="day-row">
                <div class="day-name">${day}</div>
                <div class="day-classes">
                    ${schedule[day].map(classInfo => `
                        <div class="class-item">
                            <span class="class-time">${classInfo.time}</span>
                            <span class="class-subject">${classInfo.subject}</span>
                            <button class="delete-class-btn" 
                                    onclick="deleteClass('${day}', '${classInfo.id}')">
                                ×
                            </button>
                        </div>
                    `).join('')}
                    <button class="add-class-btn" onclick="openAddClassModal('${day}')">+</button>
                </div>
            </div>
        `).join('');

        // Update subject options in modal
        const subjectSelect = document.getElementById('classSubject');
        subjectSelect.innerHTML = subjects.map(subject => 
            `<option value="${subject}">${subject}</option>`
        ).join('');
    }

    window.openAddClassModal = function(day) {
        selectedDay = day;
        modal.style.display = 'block';
        document.getElementById('classTime').value = '';
        // Force reflow
        modal.offsetHeight;
        modal.classList.add('visible');
    };

    window.closeModal = function() {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200); // Match the transition duration
    };

    window.deleteClass = function(day, classId) {
        const schedule = getSchedule();
        schedule[day] = schedule[day].filter(classInfo => classInfo.id !== classId);
        localStorage.setItem('schedule', JSON.stringify(schedule));
        displaySchedule();
    };

    addClassForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const subject = document.getElementById('classSubject').value;
        const time = document.getElementById('classTime').value;
        
        const schedule = getSchedule();
        
        // Add unique ID to each class
        const classId = `${subject}_${time}_${Date.now()}`;
        schedule[selectedDay].push({ id: classId, subject, time });
        schedule[selectedDay].sort((a, b) => a.time.localeCompare(b.time));
        
        localStorage.setItem('schedule', JSON.stringify(schedule));
        closeModal();
        displaySchedule();
    });

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };

    displaySchedule();
}

// Dashboard page functionality
if (isCurrentPage('index.html')) {
    const todayClassesDiv = document.getElementById('todayClasses');
    const attendanceSummary = document.getElementById('attendanceSummary');
    const selectedDateElement = document.getElementById('selectedDate');
    let currentDate = new Date();

    function formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    function updateDateDisplay() {
        selectedDateElement.textContent = formatDate(currentDate);
        updateNavigationButtons();
    }

    window.changeDay = function(offset) {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + offset);
        
        // Don't allow future dates
        if (newDate > new Date()) {
            return;
        }
        
        currentDate = newDate;
        updateDateDisplay();
        displayTodayClasses();
    };

    window.goToToday = function() {
        currentDate = new Date();
        updateDateDisplay();
        displayTodayClasses();
    };

    function getCurrentDaySchedule() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[currentDate.getDay()];
        return dayOfWeek === 'Sunday' || dayOfWeek === 'Saturday' ? [] : getSchedule()[dayOfWeek];
    }

    function displayTodayClasses() {
        const todayClasses = getCurrentDaySchedule();
        const attendance = getAttendance();
        const dateString = currentDate.toISOString().split('T')[0];

        todayClassesDiv.innerHTML = todayClasses.length ? todayClasses.map(classInfo => `
            <div class="attendance-card">
                <span>${classInfo.subject} (${classInfo.time})</span>
                <div class="attendance-options">
                    <button onclick="markAttendance('${classInfo.id}', 'attended', '${dateString}')" 
                            class="${attendance[dateString]?.[classInfo.id] === 'attended' ? 'selected' : ''}">
                        Attended
                    </button>
                    <button onclick="markAttendance('${classInfo.id}', 'missed', '${dateString}')"
                            class="${attendance[dateString]?.[classInfo.id] === 'missed' ? 'selected' : ''}">
                        Missed
                    </button>
                    <button onclick="markAttendance('${classInfo.id}', 'noClass', '${dateString}')"
                            class="${attendance[dateString]?.[classInfo.id] === 'noClass' ? 'selected' : ''}">
                        No Class
                    </button>
                </div>
            </div>
        `).join('') : '<p>No classes scheduled for this day</p>';
    }

    function displayAttendanceSummary() {
        const attendance = getAttendance();
        const subjects = getSubjects();
        
        const summary = subjects.map(subject => {
            let attended = 0;
            let total = 0;

            Object.entries(attendance).forEach(([date, dayAttendance]) => {
                Object.entries(dayAttendance).forEach(([classId, status]) => {
                    if (classId.startsWith(subject + '_')) {
                        if (status !== 'noClass') {
                            total++;
                            if (status === 'attended') {
                                attended++;
                            }
                        }
                    }
                });
            });

            const percentage = total === 0 ? 0 : Math.round((attended / total) * 100);
            const attendanceClass = percentage >= 75 ? 'high' : 
                                  percentage >= 50 ? 'medium' : 'low';
            
            return `
                <div class="attendance-summary-item">
                    <h3>${subject}</h3>
                    <div class="attendance-percentage ${attendanceClass}">${percentage}%</div>
                    <div class="attendance-details">
                        ${attended}/${total} classes attended
                    </div>
                </div>
            `;
        });

        attendanceSummary.innerHTML = summary.join('');
    }

    window.markAttendance = function(classId, status, date) {
        const attendance = getAttendance();
        if (!attendance[date]) {
            attendance[date] = {};
        }
        attendance[date][classId] = status;
        localStorage.setItem('attendance', JSON.stringify(attendance));
        displayTodayClasses();
        displayAttendanceSummary();
    };

    // Optionally, disable the forward arrow if we're on the current date
    function updateNavigationButtons() {
        const forwardButton = document.querySelector('.nav-btn:last-child');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDay = new Date(currentDate);
        currentDay.setHours(0, 0, 0, 0);
        
        if (currentDay.getTime() === today.getTime()) {
            forwardButton.disabled = true;
            forwardButton.style.opacity = '0.5';
            forwardButton.style.cursor = 'not-allowed';
        } else {
            forwardButton.disabled = false;
            forwardButton.style.opacity = '1';
            forwardButton.style.cursor = 'pointer';
        }
    }

    // Initialize the display
    updateDateDisplay();
    displayTodayClasses();
    displayAttendanceSummary();
} 