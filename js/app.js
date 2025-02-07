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
            <div class="day-schedule">
                <h2>${day}</h2>
                <div class="day-classes">
                    ${schedule[day].map(classInfo => `
                        <div class="class-item">
                            <div class="class-info">
                                <span class="class-time">${classInfo.time}</span>
                                <span class="class-subject">${classInfo.subject}</span>
                            </div>
                            <button class="delete-class-btn" 
                                    onclick="deleteClass('${day}', '${classInfo.time}', '${classInfo.subject}')">
                                Delete
                            </button>
                        </div>
                    `).join('') || '<p>No classes scheduled</p>'}
                </div>
                <button class="add-class-btn" onclick="openAddClassModal('${day}')">+ Add Class</button>
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
    };

    window.closeModal = function() {
        modal.style.display = 'none';
    };

    window.deleteClass = function(day, time, subject) {
        const schedule = getSchedule();
        schedule[day] = schedule[day].filter(classInfo => 
            !(classInfo.time === time && classInfo.subject === subject)
        );
        localStorage.setItem('schedule', JSON.stringify(schedule));
        displaySchedule();
    };

    addClassForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const subject = document.getElementById('classSubject').value;
        const time = document.getElementById('classTime').value;
        
        const schedule = getSchedule();
        
        // Sort classes by time
        schedule[selectedDay].push({ subject, time });
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
    const todayClasses = document.getElementById('todayClasses');
    const attendanceSummary = document.getElementById('attendanceSummary');

    function getCurrentDaySchedule() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        return today === 'Sunday' || today === 'Saturday' 
            ? [] 
            : getSchedule()[today].map(classInfo => classInfo.subject);
    }

    function displayTodayClasses() {
        const todaySubjects = getCurrentDaySchedule();
        const attendance = getAttendance();
        const today = new Date().toISOString().split('T')[0];

        todayClasses.innerHTML = todaySubjects.length ? todaySubjects.map(subject => `
            <div class="attendance-card">
                <span>${subject}</span>
                <div class="attendance-options">
                    <button onclick="markAttendance('${subject}', 'attended', '${today}')" 
                            class="${attendance[today]?.[subject] === 'attended' ? 'selected' : ''}">
                        Attended
                    </button>
                    <button onclick="markAttendance('${subject}', 'missed', '${today}')"
                            class="${attendance[today]?.[subject] === 'missed' ? 'selected' : ''}">
                        Missed
                    </button>
                    <button onclick="markAttendance('${subject}', 'noClass', '${today}')"
                            class="${attendance[today]?.[subject] === 'noClass' ? 'selected' : ''}">
                        No Class
                    </button>
                </div>
            </div>
        `).join('') : '<p>No classes scheduled for today</p>';
    }

    function displayAttendanceSummary() {
        const attendance = getAttendance();
        const subjects = getSubjects();
        
        const summary = subjects.map(subject => {
            let attended = 0;
            let total = 0;

            Object.values(attendance).forEach(dayAttendance => {
                if (dayAttendance[subject]) {
                    if (dayAttendance[subject] !== 'noClass') {
                        total++;
                        if (dayAttendance[subject] === 'attended') {
                            attended++;
                        }
                    }
                }
            });

            const percentage = total === 0 ? 0 : Math.round((attended / total) * 100);
            return `
                <div class="attendance-summary-item">
                    <h3>${subject}</h3>
                    <p>Attendance: ${percentage}% (${attended}/${total} classes)</p>
                </div>
            `;
        });

        attendanceSummary.innerHTML = summary.join('');
    }

    window.markAttendance = function(subject, status, date) {
        const attendance = getAttendance();
        if (!attendance[date]) {
            attendance[date] = {};
        }
        attendance[date][subject] = status;
        localStorage.setItem('attendance', JSON.stringify(attendance));
        displayTodayClasses();
        displayAttendanceSummary();
    };

    displayTodayClasses();
    displayAttendanceSummary();
} 