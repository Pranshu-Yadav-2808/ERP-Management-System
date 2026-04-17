const ERP_STORAGE_KEYS = {
    students: "erp_students",
    courses: "erp_courses",
    payments: "erp_payments",
    attendance: "erp_attendance",
    profile: "erp_profile",
    session: "erp_session"
};

function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

const defaultCourses = [
    {
        id: createId(),
        name: "Full Stack Development",
        duration: "6 Months",
        fee: 18000,
        description: "HTML, CSS, JavaScript, Bootstrap, PHP, MySQL, and deployment basics."
    },
    {
        id: createId(),
        name: "Python Programming",
        duration: "4 Months",
        fee: 14000,
        description: "Core Python, automation, APIs, and project-based learning."
    },
    {
        id: createId(),
        name: "UI/UX Design",
        duration: "3 Months",
        fee: 12000,
        description: "Wireframes, Figma workflow, prototypes, and product design fundamentals."
    }
];

const defaultStudents = [
    {
        id: createId(),
        name: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        phone: "9876543210",
        course: "Full Stack Development",
        status: "Active",
        joinDate: "2026-03-10"
    },
    {
        id: createId(),
        name: "Priya Verma",
        email: "priya.verma@example.com",
        phone: "9876501234",
        course: "Python Programming",
        status: "Pending",
        joinDate: "2026-03-18"
    },
    {
        id: createId(),
        name: "Rohan Mehta",
        email: "rohan.mehta@example.com",
        phone: "9811102233",
        course: "UI/UX Design",
        status: "Completed",
        joinDate: "2026-02-01"
    }
];

const defaultPayments = [
    {
        id: createId(),
        student: "Aarav Sharma",
        course: "Full Stack Development",
        amount: 9000,
        method: "UPI",
        date: "2026-04-05",
        status: "Paid"
    },
    {
        id: createId(),
        student: "Priya Verma",
        course: "Python Programming",
        amount: 5000,
        method: "Card",
        date: "2026-04-07",
        status: "Partial"
    }
];

const defaultProfile = {
    name: "Nisha Kapoor",
    role: "ERP Administrator",
    email: "admin@erp.com",
    phone: "+91 98765 00000",
    institute: "NextGen IT Training Institute",
    location: "Bangalore, India",
    bio: "Oversees admissions, fee operations, and reporting workflows for the training institute ERP."
};

document.addEventListener("DOMContentLoaded", () => {
    seedInitialData();

    const page = document.body.dataset.page;
    if (!page) return;

    if (page !== "login" && page !== "registration") {
        renderShell();
    }

    const pageInitializers = {
        login: initLoginPage,
        registration: initRegistrationPage,
        dashboard: initDashboardPage,
        students: initStudentsPage,
        courses: initCoursesPage,
        fees: initFeesPage,
        attendance: initAttendancePage,
        profile: initProfilePage
    };

    if (pageInitializers[page]) {
        pageInitializers[page]();
    }
});

function seedInitialData() {
    seedIfEmpty(ERP_STORAGE_KEYS.courses, defaultCourses);
    seedIfEmpty(ERP_STORAGE_KEYS.students, defaultStudents);
    seedIfEmpty(ERP_STORAGE_KEYS.payments, defaultPayments);
    seedIfEmpty(ERP_STORAGE_KEYS.attendance, {});
    seedIfEmpty(ERP_STORAGE_KEYS.profile, defaultProfile);
    seedIfEmpty(ERP_STORAGE_KEYS.session, defaultProfileToSession());
}

function seedIfEmpty(key, value) {
    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

function getData(key) {
    return JSON.parse(localStorage.getItem(key));
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getStudents() {
    return getData(ERP_STORAGE_KEYS.students) || [];
}

function saveStudents(students) {
    setData(ERP_STORAGE_KEYS.students, students);
}

function getCourses() {
    return getData(ERP_STORAGE_KEYS.courses) || [];
}

function saveCourses(courses) {
    setData(ERP_STORAGE_KEYS.courses, courses);
}

function getPayments() {
    return getData(ERP_STORAGE_KEYS.payments) || [];
}

function savePayments(payments) {
    setData(ERP_STORAGE_KEYS.payments, payments);
}

function getAttendance() {
    return getData(ERP_STORAGE_KEYS.attendance) || {};
}

function saveAttendance(attendance) {
    setData(ERP_STORAGE_KEYS.attendance, attendance);
}

function getProfile() {
    return getData(ERP_STORAGE_KEYS.profile) || {};
}

function saveProfile(profile) {
    setData(ERP_STORAGE_KEYS.profile, profile);
}

function getSession() {
    return getData(ERP_STORAGE_KEYS.session) || {};
}

function saveSession(session) {
    setData(ERP_STORAGE_KEYS.session, session);
}

function defaultProfileToSession() {
    return {
        name: defaultProfile.name,
        role: "Administrator",
        email: defaultProfile.email
    };
}

function renderShell() {
    renderSidebar();
    renderNavbar();
}

function renderSidebar() {
    const sidebarHost = document.getElementById("appSidebar");
    if (!sidebarHost) return;

    const currentPage = document.body.dataset.page;
    const navItems = [
        { href: "dashboard.html", key: "dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
        { href: "students.html", key: "students", label: "Students", icon: "bi-people-fill" },
        { href: "courses.html", key: "courses", label: "Courses", icon: "bi-journal-richtext" },
        { href: "fees.html", key: "fees", label: "Fees", icon: "bi-cash-coin" },
        { href: "attendance.html", key: "attendance", label: "Attendance", icon: "bi-calendar-check-fill" },
        { href: "profile.html", key: "profile", label: "Profile", icon: "bi-person-badge-fill" },
        { href: "index.html", key: "logout", label: "Logout", icon: "bi-box-arrow-left" }
    ];

    sidebarHost.innerHTML = `
        <div class="sidebar">
            <div class="sidebar-brand">
                <div class="sidebar-brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
                <div>
                    <h2>Institute ERP</h2>
                    <p>Training Management Suite</p>
                </div>
            </div>
            <nav class="sidebar-nav">
                ${navItems.map((item) => `
                    <a class="sidebar-link ${currentPage === item.key ? "active" : ""}" href="${item.href}" ${item.key === "logout" ? 'id="logoutLink"' : ""}>
                        <i class="bi ${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                `).join("")}
            </nav>
            <div class="sidebar-footer">
                <strong>Frontend Demo</strong>
                <p class="small mb-0 mt-1 text-white-50">Data persists in your browser using localStorage only.</p>
            </div>
        </div>
    `;

    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", () => {
            saveSession(defaultProfileToSession());
        });
    }
}

function renderNavbar() {
    const navbarHost = document.getElementById("appNavbar");
    if (!navbarHost) return;

    const session = getSession();
    const title = document.body.dataset.pageTitle || "ERP";
    navbarHost.innerHTML = `
        <div class="topbar">
            <div class="topbar-inner">
                <div>
                    <h1>${title}</h1>
                    <p>Manage your institute workflow efficiently.</p>
                </div>
                <div class="topbar-user">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" alt="Admin">
                    <div>
                        <strong>${session.name || "Admin User"}</strong>
                        <p>${session.role || "Administrator"}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initLoginPage() {
    const loginForm = document.getElementById("loginForm");
    const fillDemoBtn = document.getElementById("fillDemoBtn");
    const emailField = document.getElementById("userEmail");
    const passwordField = document.getElementById("userPassword");
    const roleField = document.getElementById("userRole");

    fillDemoBtn.addEventListener("click", () => {
        emailField.value = "admin@erp.com";
        passwordField.value = "123456";
        roleField.value = "Administrator";
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        saveSession({
            name: "Nisha Kapoor",
            role: roleField.value,
            email: emailField.value.trim() || "admin@erp.com"
        });

        window.location.href = "dashboard.html";
    });
}

function initRegistrationPage() {
    populateCourseSelect(document.getElementById("regCourse"));

    const form = document.getElementById("registrationForm");
    const message = document.getElementById("registrationMessage");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const student = {
            id: createId(),
            name: document.getElementById("regName").value.trim(),
            email: document.getElementById("regEmail").value.trim(),
            phone: document.getElementById("regPhone").value.trim(),
            course: document.getElementById("regCourse").value,
            status: document.getElementById("regStatus").value,
            joinDate: document.getElementById("regJoinDate").value,
            duration: document.getElementById("regDuration").value.trim(),
            address: document.getElementById("regAddress").value.trim()
        };

        const students = getStudents();
        students.unshift(student);
        saveStudents(students);
        form.reset();

        message.className = "mb-0 text-center fw-semibold text-success";
        message.textContent = "Student registered successfully. The record is now available in Students.";
        populateCourseSelect(document.getElementById("regCourse"));
    });
}

function initDashboardPage() {
    const students = getStudents();
    const courses = getCourses();
    const payments = getPayments();
    const totalFees = payments.reduce((sum, item) => sum + Number(item.amount), 0);

    document.getElementById("totalStudentsCount").textContent = students.length;
    document.getElementById("totalCoursesCount").textContent = courses.length;
    document.getElementById("feesCollectedCount").textContent = formatCurrency(totalFees);

    renderDashboardInsights(students, courses, payments);
    renderDashboardChart(students, payments);
}

function renderDashboardInsights(students, courses, payments) {
    const activeStudents = students.filter((student) => student.status === "Active").length;
    const pendingStudents = students.filter((student) => student.status === "Pending").length;
    const recentPayments = payments.slice(0, 3);

    document.getElementById("dashboardInsights").innerHTML = `
        <div class="insight-item">
            <h3>${activeStudents}</h3>
            <p>Students currently marked active.</p>
        </div>
        <div class="insight-item">
            <h3>${pendingStudents}</h3>
            <p>Admissions still in pending stage.</p>
        </div>
        <div class="insight-item">
            <h3>${courses[0]?.name || "No Courses"}</h3>
            <p>Featured program with frontend visibility.</p>
        </div>
        <div class="insight-item">
            <h3>${recentPayments.length}</h3>
            <p>Recent fee entries available in payment history.</p>
        </div>
    `;
}

function renderDashboardChart(students, payments) {
    const chartCanvas = document.getElementById("dashboardChart");
    if (!chartCanvas || typeof Chart === "undefined") return;

    const paymentTotal = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const admissionBase = students.length || 1;

    new Chart(chartCanvas, {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
                {
                    label: "Admissions",
                    data: [Math.max(admissionBase - 2, 1), admissionBase - 1, admissionBase, admissionBase + 1, admissionBase + 2, admissionBase + 3],
                    borderColor: "#4f7cff",
                    backgroundColor: "rgba(79, 124, 255, 0.15)",
                    fill: true,
                    tension: 0.4
                },
                {
                    label: "Revenue",
                    data: [
                        Math.round(paymentTotal * 0.35) || 4000,
                        Math.round(paymentTotal * 0.45) || 6000,
                        Math.round(paymentTotal * 0.55) || 9000,
                        Math.round(paymentTotal * 0.75) || 11000,
                        Math.round(paymentTotal * 0.95) || 13000,
                        paymentTotal || 15000
                    ],
                    borderColor: "#17b26a",
                    backgroundColor: "rgba(23, 178, 106, 0.1)",
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    position: "top"
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initStudentsPage() {
    const form = document.getElementById("studentForm");
    const modalElement = document.getElementById("studentModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    const searchInput = document.getElementById("studentSearch");

    populateCourseSelect(document.getElementById("studentCourse"));
    renderStudentsTable();

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const id = document.getElementById("studentId").value;
        const students = getStudents();
        const studentRecord = {
            id: id || createId(),
            name: document.getElementById("studentName").value.trim(),
            email: document.getElementById("studentEmail").value.trim(),
            course: document.getElementById("studentCourse").value,
            status: document.getElementById("studentStatus").value,
            phone: document.getElementById("studentPhone").value.trim(),
            joinDate: document.getElementById("studentJoinDate").value
        };

        const existingIndex = students.findIndex((student) => student.id === studentRecord.id);
        if (existingIndex >= 0) {
            students[existingIndex] = studentRecord;
        } else {
            students.unshift(studentRecord);
        }

        saveStudents(students);
        form.reset();
        document.getElementById("studentId").value = "";
        document.getElementById("studentModalLabel").textContent = "Add Student";
        modal.hide();
        renderStudentsTable(searchInput.value);
    });

    searchInput.addEventListener("input", (event) => {
        renderStudentsTable(event.target.value);
    });

    modalElement.addEventListener("hidden.bs.modal", () => {
        form.reset();
        document.getElementById("studentId").value = "";
        document.getElementById("studentModalLabel").textContent = "Add Student";
    });
}

function renderStudentsTable(query = "") {
    const students = getStudents();
    const tbody = document.getElementById("studentsTableBody");
    const normalizedQuery = query.trim().toLowerCase();
    const filteredStudents = students.filter((student) => {
        const haystack = `${student.name} ${student.email} ${student.course}`.toLowerCase();
        return haystack.includes(normalizedQuery);
    });

    if (!filteredStudents.length) {
        tbody.innerHTML = emptyTableRow("No student records found.");
        return;
    }

    tbody.innerHTML = filteredStudents.map((student) => `
        <tr>
            <td>
                <div class="fw-semibold">${student.name}</div>
                <div class="small text-secondary">${student.phone || "No phone"}</div>
            </td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${statusBadge(student.status)}</td>
            <td class="text-end">
                <div class="table-action-group">
                    <button class="table-action-btn" type="button" onclick="editStudent('${student.id}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="table-action-btn" type="button" onclick="deleteStudent('${student.id}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function editStudent(studentId) {
    const student = getStudents().find((entry) => entry.id === studentId);
    if (!student) return;

    document.getElementById("studentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentEmail").value = student.email;
    document.getElementById("studentCourse").value = student.course;
    document.getElementById("studentStatus").value = student.status;
    document.getElementById("studentPhone").value = student.phone || "";
    document.getElementById("studentJoinDate").value = student.joinDate || "";
    document.getElementById("studentModalLabel").textContent = "Edit Student";
    bootstrap.Modal.getOrCreateInstance(document.getElementById("studentModal")).show();
}

function deleteStudent(studentId) {
    const students = getStudents().filter((student) => student.id !== studentId);
    saveStudents(students);
    renderStudentsTable(document.getElementById("studentSearch").value);
}

function initCoursesPage() {
    const form = document.getElementById("courseForm");
    const modalElement = document.getElementById("courseModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    renderCoursesGrid();

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const id = document.getElementById("courseId").value;
        const courses = getCourses();
        const courseRecord = {
            id: id || createId(),
            name: document.getElementById("courseName").value.trim(),
            duration: document.getElementById("courseDuration").value.trim(),
            fee: Number(document.getElementById("courseFee").value),
            description: document.getElementById("courseDescription").value.trim()
        };

        const existingIndex = courses.findIndex((course) => course.id === courseRecord.id);
        if (existingIndex >= 0) {
            courses[existingIndex] = courseRecord;
        } else {
            courses.unshift(courseRecord);
        }

        saveCourses(courses);
        form.reset();
        document.getElementById("courseId").value = "";
        document.getElementById("courseModalLabel").textContent = "Add Course";
        modal.hide();
        renderCoursesGrid();
    });

    modalElement.addEventListener("hidden.bs.modal", () => {
        form.reset();
        document.getElementById("courseId").value = "";
        document.getElementById("courseModalLabel").textContent = "Add Course";
    });
}

function renderCoursesGrid() {
    const courses = getCourses();
    const host = document.getElementById("coursesGrid");

    if (!courses.length) {
        host.innerHTML = `<div class="col-12"><div class="panel-card empty-state"><i class="bi bi-journal-x"></i>No courses available.</div></div>`;
        return;
    }

    host.innerHTML = courses.map((course) => `
        <div class="col-md-6 col-xl-4">
            <div class="panel-card course-card">
                <div class="panel-header">
                    <div>
                        <h2>${course.name}</h2>
                        <p>${course.description}</p>
                    </div>
                </div>
                <div class="course-price">${formatCurrency(course.fee)}</div>
                <div class="meta-chip-group">
                    <span class="meta-chip"><i class="bi bi-clock-history"></i>${course.duration}</span>
                    <span class="meta-chip"><i class="bi bi-collection"></i>${countStudentsByCourse(course.name)} Students</span>
                </div>
                <div class="table-action-group justify-content-start">
                    <button class="table-action-btn" type="button" onclick="editCourse('${course.id}')"><i class="bi bi-pencil-square"></i></button>
                    <button class="table-action-btn" type="button" onclick="deleteCourse('${course.id}')"><i class="bi bi-trash3"></i></button>
                </div>
            </div>
        </div>
    `).join("");
}

function editCourse(courseId) {
    const course = getCourses().find((entry) => entry.id === courseId);
    if (!course) return;

    document.getElementById("courseId").value = course.id;
    document.getElementById("courseName").value = course.name;
    document.getElementById("courseDuration").value = course.duration;
    document.getElementById("courseFee").value = course.fee;
    document.getElementById("courseDescription").value = course.description;
    document.getElementById("courseModalLabel").textContent = "Edit Course";
    bootstrap.Modal.getOrCreateInstance(document.getElementById("courseModal")).show();
}

function deleteCourse(courseId) {
    const courses = getCourses().filter((course) => course.id !== courseId);
    saveCourses(courses);
    renderCoursesGrid();
}

function initFeesPage() {
    populateStudentSelect(document.getElementById("paymentStudent"));
    populateCourseSelect(document.getElementById("paymentCourse"));

    const dateInput = document.getElementById("paymentDate");
    dateInput.value = new Date().toISOString().split("T")[0];

    renderPaymentsTable();

    document.getElementById("paymentForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const payments = getPayments();
        payments.unshift({
            id: createId(),
            student: document.getElementById("paymentStudent").value,
            course: document.getElementById("paymentCourse").value,
            amount: Number(document.getElementById("paymentAmount").value),
            method: document.getElementById("paymentMethod").value,
            date: document.getElementById("paymentDate").value,
            status: document.getElementById("paymentStatus").value
        });

        savePayments(payments);
        event.target.reset();
        dateInput.value = new Date().toISOString().split("T")[0];
        renderPaymentsTable();
    });
}

function renderPaymentsTable() {
    const payments = getPayments();
    const tbody = document.getElementById("paymentsTableBody");

    if (!payments.length) {
        tbody.innerHTML = emptyTableRow("No payments have been recorded yet.", 6);
        return;
    }

    tbody.innerHTML = payments.map((payment) => `
        <tr>
            <td>${payment.student}</td>
            <td>${payment.course}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${payment.method}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${statusBadge(payment.status)}</td>
        </tr>
    `).join("");
}

function initAttendancePage() {
    const dateInput = document.getElementById("attendanceDate");
    dateInput.value = new Date().toISOString().split("T")[0];

    renderAttendanceTable();
    dateInput.addEventListener("change", renderAttendanceTable);
}

function renderAttendanceTable() {
    const students = getStudents();
    const tbody = document.getElementById("attendanceTableBody");
    const date = document.getElementById("attendanceDate").value;
    const attendanceData = getAttendance();
    const dailyAttendance = attendanceData[date] || {};

    if (!students.length) {
        tbody.innerHTML = emptyTableRow("No students available for attendance.", 4);
        return;
    }

    tbody.innerHTML = students.map((student) => {
        const status = dailyAttendance[student.id] || "Pending";
        return `
            <tr>
                <td>${student.name}</td>
                <td>${student.course}</td>
                <td>${statusBadge(status)}</td>
                <td class="text-end">
                    <div class="attendance-actions">
                        <button class="btn btn-sm btn-outline-success" onclick="setAttendance('${student.id}', 'Present')">Present</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="setAttendance('${student.id}', 'Absent')">Absent</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    renderAttendanceSummary(date);
}

function setAttendance(studentId, status) {
    const date = document.getElementById("attendanceDate").value;
    const attendance = getAttendance();
    if (!attendance[date]) {
        attendance[date] = {};
    }
    attendance[date][studentId] = status;
    saveAttendance(attendance);
    renderAttendanceTable();
}

function renderAttendanceSummary(date) {
    const attendance = getAttendance()[date] || {};
    const students = getStudents();
    const presentCount = Object.values(attendance).filter((status) => status === "Present").length;
    const absentCount = Object.values(attendance).filter((status) => status === "Absent").length;
    const pendingCount = Math.max(students.length - presentCount - absentCount, 0);

    document.getElementById("attendanceSummary").innerHTML = `
        <div class="attendance-summary-card">
            <h3>${students.length}</h3>
            <p>Total students for ${formatDate(date)}</p>
        </div>
        <div class="attendance-summary-card">
            <h3>${presentCount}</h3>
            <p>Marked present</p>
        </div>
        <div class="attendance-summary-card">
            <h3>${absentCount}</h3>
            <p>Marked absent</p>
        </div>
        <div class="attendance-summary-card">
            <h3>${pendingCount}</h3>
            <p>Still pending update</p>
        </div>
    `;
}

function initProfilePage() {
    const profile = getProfile();
    setProfileUI(profile);

    document.getElementById("profileName").value = profile.name || "";
    document.getElementById("profileRole").value = profile.role || "";
    document.getElementById("profileEmail").value = profile.email || "";
    document.getElementById("profilePhone").value = profile.phone || "";
    document.getElementById("profileInstitute").value = profile.institute || "";
    document.getElementById("profileLocation").value = profile.location || "";
    document.getElementById("profileBio").value = profile.bio || "";

    document.getElementById("profileForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const updatedProfile = {
            name: document.getElementById("profileName").value.trim(),
            role: document.getElementById("profileRole").value.trim(),
            email: document.getElementById("profileEmail").value.trim(),
            phone: document.getElementById("profilePhone").value.trim(),
            institute: document.getElementById("profileInstitute").value.trim(),
            location: document.getElementById("profileLocation").value.trim(),
            bio: document.getElementById("profileBio").value.trim()
        };
        saveProfile(updatedProfile);
        saveSession({
            name: updatedProfile.name,
            role: updatedProfile.role,
            email: updatedProfile.email
        });
        setProfileUI(updatedProfile);
        renderNavbar();
    });
}

function setProfileUI(profile) {
    document.getElementById("profileNameCard").textContent = profile.name || "Admin User";
    document.getElementById("profileRoleCard").textContent = profile.role || "Administrator";
    document.getElementById("profileInstituteCard").textContent = profile.institute || "Institute";
}

function populateCourseSelect(selectElement) {
    if (!selectElement) return;
    const courses = getCourses();
    if (!courses.length) {
        selectElement.innerHTML = `<option value="">No courses available</option>`;
        return;
    }
    selectElement.innerHTML = courses.map((course) => `
        <option value="${course.name}">${course.name}</option>
    `).join("");
}

function populateStudentSelect(selectElement) {
    if (!selectElement) return;
    const students = getStudents();
    if (!students.length) {
        selectElement.innerHTML = `<option value="">No students available</option>`;
        return;
    }
    selectElement.innerHTML = students.map((student) => `
        <option value="${student.name}">${student.name}</option>
    `).join("");
}

function countStudentsByCourse(courseName) {
    return getStudents().filter((student) => student.course === courseName).length;
}

function statusBadge(status) {
    const normalized = String(status).toLowerCase();
    const className = {
        active: "status-active",
        paid: "status-paid",
        present: "status-present",
        pending: "status-pending",
        partial: "status-partial",
        completed: "status-completed",
        absent: "status-absent"
    }[normalized] || "status-pending";

    return `<span class="status-badge ${className}">${status}</span>`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(amount || 0));
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function emptyTableRow(message, colSpan = 5) {
    return `
        <tr>
            <td colspan="${colSpan}">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    ${message}
                </div>
            </td>
        </tr>
    `;
}
