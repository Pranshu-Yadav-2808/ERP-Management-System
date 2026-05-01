const API_BASE_URL = "http://localhost:5000/api";

let allStudents = [];
let allCourses = [];
let allPayments = [];
let attendanceDraft = {};
let dashboardChartInstance = null;

const publicPages = new Set(["login", "registration"]);

const demoAccounts = {
    admin: {
        email: "admin@erp.com",
        password: "123456",
        role: "admin"
    },
};

document.addEventListener("DOMContentLoaded", async () => {
    const page = document.body.dataset.page;

    if (isProtectedPage(page) && !hasActiveSession()) {
        redirectToLogin();
        return;
    }

    if (page && page !== "login" && page !== "registration") {
        renderShell();
    }

    const pages = {
        login: initLoginPage,
        registration: initRegistrationPage,
        dashboard: initDashboardPage,
        students: initStudentsPage,
        courses: initCoursesPage,
        fees: initFeesPage,
        attendance: initAttendancePage,
        profile: initProfilePage
    };

    if (pages[page]) {
        await pages[page]();
    }
});

window.addEventListener("pageshow", () => {
    if (isProtectedPage(document.body.dataset.page) && !hasActiveSession()) {
        redirectToLogin();
    }
});

async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("erp_token");

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "API request failed");
    }

    return data;
}

function getSession() {
    return JSON.parse(localStorage.getItem("erp_session") || "{}");
}

function saveSession(session) {
    localStorage.setItem("erp_session", JSON.stringify(session));
}

function hasActiveSession() {
    return Boolean(localStorage.getItem("erp_token") && Object.keys(getSession()).length);
}

function isProtectedPage(page) {
    return Boolean(page && !publicPages.has(page));
}

function redirectToLogin() {
    window.location.replace("index.html");
}

function logout() {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_session");
    redirectToLogin();
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
            
        </div>
    `;

    document.getElementById("logoutLink")?.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
    });
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
                    <img src="./assets/images/photo.jpg" alt="Admin">
                    <div>
                        <strong>${session.name || "Admin User"}</strong>
                        <p>${session.role || "Administrator"}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function initLoginPage() {
    const loginForm = document.getElementById("loginForm");
    const fillAdminDemoBtn = document.getElementById("fillAdminDemoBtn");
    const fillStudentDemoBtn = document.getElementById("fillStudentDemoBtn");
    const emailField = document.getElementById("userEmail");
    const passwordField = document.getElementById("userPassword");
    const roleField = document.getElementById("userRole");
    const message = document.getElementById("loginMessage");

    fillAdminDemoBtn?.addEventListener("click", () => {
        emailField.value = demoAccounts.admin.email;
        passwordField.value = demoAccounts.admin.password;
        roleField.value = "admin";
        message.classList.add("d-none");
    });

    fillStudentDemoBtn?.addEventListener("click", () => {
        emailField.value = demoAccounts.student.email;
        passwordField.value = demoAccounts.student.password;
        roleField.value = "student";
        message.classList.add("d-none");
    });

    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const role = roleField.value;
            const email = emailField.value.trim().toLowerCase();
            const password = passwordField.value.trim();

            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password, role })
            });

            localStorage.setItem("erp_token", data.token);
            saveSession(data.user);

            window.location.replace(role === "student" ? "student-dashboard.html" : "dashboard.html");
        } catch (error) {
            message.textContent = error.message || "Login failed. Run backend seed first.";
            message.classList.remove("d-none");
        }
    });
}

async function initRegistrationPage() {
    await populateCourseSelect(document.getElementById("regCourse"));

    const form = document.getElementById("registrationForm");
    const message = document.getElementById("registrationMessage");

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const student = {
                name: document.getElementById("regName").value.trim(),
                email: document.getElementById("regEmail").value.trim(),
                password: document.getElementById("regPassword").value.trim(),
                phone: document.getElementById("regPhone").value.trim(),
                course: document.getElementById("regCourse").value,
                status: document.getElementById("regStatus").value,
                joinDate: document.getElementById("regJoinDate").value,
                duration: document.getElementById("regDuration").value.trim(),
                address: document.getElementById("regAddress").value.trim()
            };

            await apiRequest("/students", {
                method: "POST",
                body: JSON.stringify(student)
            });

            form.reset();
            await populateCourseSelect(document.getElementById("regCourse"));
            message.className = "mb-0 text-center fw-semibold text-success";
            message.textContent = "Student registered successfully.";
        } catch (error) {
            message.className = "mb-0 text-center fw-semibold text-danger";
            message.textContent = error.message;
        }
    });
}

async function initDashboardPage() {
    const session = getSession();
    const role = String(session.role || "").toLowerCase();

    if (role === "student") {
        window.location.href = "student-dashboard.html";
        return;
    }

    await refreshDashboardStats();
}

async function refreshDashboardStats() {
    const stats = await apiRequest("/dashboard");

    setText("totalStudentsCount", stats.totalStudents);
    setText("totalCoursesCount", stats.totalCourses);
    setText("feesCollectedCount", formatCurrency(stats.feesCollected));

    setText("totalStudents", stats.totalStudents);
    setText("activeStudents", stats.activeStudents);
    setText("pendingStudents", stats.pendingStudents);
    setText("completedStudents", stats.completedStudents);

    document.getElementById("dashboardInsights").innerHTML = `
        <div class="insight-item">
            <h3>${stats.activeStudents}</h3>
            <p>Students currently marked active.</p>
        </div>
        <div class="insight-item">
            <h3>${stats.pendingStudents}</h3>
            <p>Admissions still pending.</p>
        </div>
        <div class="insight-item">
            <h3>${stats.featuredCourse?.name || "No Courses"}</h3>
            <p>Featured program.</p>
        </div>
        <div class="insight-item">
            <h3>${stats.recentPayments?.length || 0}</h3>
            <p>Recent fee entries.</p>
        </div>
    `;

    renderDashboardChart(stats);
}

function renderDashboardChart(stats) {
    const chartCanvas = document.getElementById("dashboardChart");
    if (!chartCanvas || typeof Chart === "undefined") return;

    if (dashboardChartInstance) {
        dashboardChartInstance.destroy();
    }

    dashboardChartInstance = new Chart(chartCanvas, {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
                {
                    label: "Admissions",
                    data: [
                        Math.max(stats.totalStudents - 2, 0),
                        Math.max(stats.totalStudents - 1, 0),
                        stats.totalStudents,
                        stats.totalStudents + 1,
                        stats.totalStudents + 2,
                        stats.totalStudents + 3
                    ],
                    borderColor: "#4f7cff",
                    backgroundColor: "rgba(79, 124, 255, 0.15)",
                    fill: true,
                    tension: 0.4
                },
                {
                    label: "Revenue",
                    data: [
                        Math.round(stats.feesCollected * 0.35) || 4000,
                        Math.round(stats.feesCollected * 0.45) || 6000,
                        Math.round(stats.feesCollected * 0.55) || 9000,
                        Math.round(stats.feesCollected * 0.75) || 11000,
                        Math.round(stats.feesCollected * 0.95) || 13000,
                        stats.feesCollected || 15000
                    ],
                    borderColor: "#17b26a",
                    backgroundColor: "rgba(23, 178, 106, 0.1)",
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            plugins: { legend: { position: "top" } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

async function initStudentsPage() {
    const form = document.getElementById("studentForm");
    const modalElement = document.getElementById("studentModal");
    const modal = modalElement ? bootstrap.Modal.getOrCreateInstance(modalElement) : null;
    const searchInput = document.getElementById("studentSearch");
    const joinDateInput = document.getElementById("studentJoinDate");
    const passwordInput = document.getElementById("studentPassword");

    await populateCourseSelect(document.getElementById("studentCourse"));
    resetStudentForm();
    await loadStudentsFromAPI();

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = document.getElementById("studentId").value;
        const phone = document.getElementById("studentPhone").value.trim();
        if (!/^\d{10}$/.test(phone)) {
            showToast("Enter a valid 10 digit phone number", "error");
            return;
        }

        const student = {
            name: document.getElementById("studentName").value.trim(),
            email: document.getElementById("studentEmail").value.trim(),
            password: document.getElementById("studentPassword").value.trim(),
            phone,
            fatherName: document.getElementById("studentFatherName").value.trim(),
            motherName: document.getElementById("studentMotherName").value.trim(),
            dateOfBirth: document.getElementById("studentDob").value,
            category: document.getElementById("studentCategory").value,
            course: document.getElementById("studentCourse").value,
            duration: document.getElementById("studentDuration").value,
            status: document.getElementById("studentStatus").value,
            joinDate: document.getElementById("studentJoinDate").value,
            address: document.getElementById("studentAddress").value.trim()
        };

        let savedStudent;
        if (id) {
            savedStudent = await apiRequest(`/students/${id}`, {
                method: "PUT",
                body: JSON.stringify(student)
            });
        } else {
            savedStudent = await apiRequest("/students", {
                method: "POST",
                body: JSON.stringify(student)
            });
        }

        saveStudentExtraDetails(savedStudent?._id || id, savedStudent?.email || student.email, student);

        form.reset();
        document.getElementById("studentId").value = "";
        resetStudentForm();
        modal?.hide();
        await loadStudentsFromAPI(searchInput?.value || "");
        showToast("Student saved successfully", "success");
    });

    searchInput?.addEventListener("input", () => {
        renderStudentsTable(searchInput.value);
    });

    modalElement?.addEventListener("hidden.bs.modal", () => {
        form.reset();
        document.getElementById("studentId").value = "";
        resetStudentForm();
    });

    modalElement?.addEventListener("show.bs.modal", () => {
        if (!document.getElementById("studentId").value) {
            resetStudentForm();
        }
    });

    function resetStudentForm() {
        document.getElementById("studentModalLabel").textContent = "New Registration";
        if (joinDateInput && !joinDateInput.value) {
            joinDateInput.value = new Date().toISOString().split("T")[0];
        }
        if (passwordInput && !passwordInput.value) {
            passwordInput.value = generateStudentPassword();
        }
    }
}

async function loadStudentsFromAPI() {
    const loading = document.getElementById("loadingText");
    if (loading) loading.style.display = "block";

    const students = await apiRequest("/students");
    allStudents = students.map(mergeStudentExtraDetails);

    if (loading) loading.style.display = "none";
    renderStudentsTable(document.getElementById("studentSearch")?.value || "");
}

function renderStudentsTable(query = "") {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) return;

    const normalizedQuery = query.trim().toLowerCase();

    const students = allStudents.filter((student) => {
        const haystack = [
            student.name,
            student.email,
            student.phone,
            student.fatherName,
            student.motherName,
            student.category,
            student.course,
            student.duration,
            student.address,
            student.status
        ].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
    });

    if (!students.length) {
        tbody.innerHTML = emptyTableRow("No student records found.", 7);
        return;
    }

    tbody.innerHTML = students.map((student) => `
        <tr>
            <td>
                <div class="fw-semibold">${escapeHtml(student.name || "-")}</div>
                <div class="small text-secondary">${escapeHtml(student.email || "-")}</div>
                <div class="small text-secondary">${escapeHtml(student.phone || "-")}</div>
                <div class="small text-secondary">Password: ${escapeHtml(student.loginPassword || "Not available")}</div>
            </td>
            <td>
                <div class="small">Father: ${escapeHtml(student.fatherName || student.guardianName || "-")}</div>
                <div class="small text-secondary">Mother: ${escapeHtml(student.motherName || "-")}</div>
            </td>
            <td>
                <div>${formatDate(student.dateOfBirth)}</div>
                <div class="small text-secondary">${escapeHtml(student.category || "-")}</div>
            </td>
            <td>
                <div>${escapeHtml(student.course || "-")}</div>
                <div class="small text-secondary">${escapeHtml(student.duration || "-")}</div>
                <div class="small text-secondary">Joined: ${formatDate(student.joinDate)}</div>
            </td>
            <td>
                <div class="small">${escapeHtml(student.address || "-")}</div>
            </td>
            <td>${statusBadge(student.status)}</td>
            <td class="text-end">
                <div class="table-action-group">
                    <button class="table-action-btn" type="button" onclick="editStudent('${student._id}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="table-action-btn" type="button" onclick="deleteStudent('${student._id}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

async function editStudent(studentId) {
    const student = allStudents.find((entry) => entry._id === studentId) || await apiRequest(`/students/${studentId}`);

    document.getElementById("studentId").value = student._id;
    document.getElementById("studentName").value = student.name || "";
    document.getElementById("studentEmail").value = student.email || "";
    document.getElementById("studentPassword").value = student.loginPassword || generateStudentPassword();
    document.getElementById("studentPhone").value = student.phone || "";
    document.getElementById("studentFatherName").value = student.fatherName || student.guardianName || "";
    document.getElementById("studentMotherName").value = student.motherName || "";
    document.getElementById("studentDob").value = toInputDate(student.dateOfBirth);
    document.getElementById("studentCategory").value = student.category || "General";
    document.getElementById("studentCourse").value = student.course || "";
    document.getElementById("studentDuration").value = student.duration || "45 Days";
    document.getElementById("studentStatus").value = student.status || "Active";
    document.getElementById("studentJoinDate").value = toInputDate(student.joinDate);
    document.getElementById("studentAddress").value = student.address || "";
    document.getElementById("studentModalLabel").textContent = "Edit Registration";

    bootstrap.Modal.getOrCreateInstance(document.getElementById("studentModal")).show();
}

async function deleteStudent(studentId) {
    const confirmed = await confirmAction("Delete this student?");
    if (!confirmed) return;

    await apiRequest(`/students/${studentId}`, { method: "DELETE" });
    deleteStudentExtraDetails(studentId);
    await loadStudentsFromAPI();
    showToast("Student deleted", "success");
}

window.editStudent = editStudent;
window.deleteStudent = deleteStudent;

async function initCoursesPage() {
    const form = document.getElementById("courseForm");
    const modalElement = document.getElementById("courseModal");
    const modal = modalElement ? bootstrap.Modal.getOrCreateInstance(modalElement) : null;

    await loadCoursesFromAPI();

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = document.getElementById("courseId").value;

        const course = {
            name: document.getElementById("courseName").value.trim(),
            duration: document.getElementById("courseDuration").value.trim(),
            fee: Number(document.getElementById("courseFee").value),
            description: document.getElementById("courseDescription").value.trim()
        };

        if (id) {
            await apiRequest(`/courses/${id}`, {
                method: "PUT",
                body: JSON.stringify(course)
            });
        } else {
            await apiRequest("/courses", {
                method: "POST",
                body: JSON.stringify(course)
            });
        }

        form.reset();
        document.getElementById("courseId").value = "";
        document.getElementById("courseModalLabel").textContent = "Add Course";
        modal?.hide();
        await loadCoursesFromAPI();
    });

    modalElement?.addEventListener("hidden.bs.modal", () => {
        form.reset();
        document.getElementById("courseId").value = "";
        document.getElementById("courseModalLabel").textContent = "Add Course";
    });
}

async function loadCoursesFromAPI() {
    allCourses = await apiRequest("/courses/stats");
    renderCoursesGrid();
}

function renderCoursesGrid() {
    const host = document.getElementById("coursesGrid");
    if (!host) return;

    if (!allCourses.length) {
        host.innerHTML = `<div class="col-12"><div class="panel-card empty-state"><i class="bi bi-journal-x"></i>No courses available.</div></div>`;
        return;
    }

    host.innerHTML = allCourses.map((course) => `
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
                    <span class="meta-chip"><i class="bi bi-collection"></i>${course.studentCount || 0} Students</span>
                </div>
                <div class="table-action-group justify-content-start">
                    <button class="table-action-btn" type="button" onclick="editCourse('${course._id}')"><i class="bi bi-pencil-square"></i></button>
                    <button class="table-action-btn" type="button" onclick="deleteCourse('${course._id}')"><i class="bi bi-trash3"></i></button>
                </div>
            </div>
        </div>
    `).join("");
}

function editCourse(courseId) {
    const course = allCourses.find((entry) => entry._id === courseId);
    if (!course) return;

    document.getElementById("courseId").value = course._id;
    document.getElementById("courseName").value = course.name || "";
    document.getElementById("courseDuration").value = course.duration || "";
    document.getElementById("courseFee").value = course.fee || 0;
    document.getElementById("courseDescription").value = course.description || "";
    document.getElementById("courseModalLabel").textContent = "Edit Course";

    bootstrap.Modal.getOrCreateInstance(document.getElementById("courseModal")).show();
}

async function deleteCourse(courseId) {
    const confirmed = await confirmAction("Delete this course?");
    if (!confirmed) return;

    await apiRequest(`/courses/${courseId}`, { method: "DELETE" });
    await loadCoursesFromAPI();
}

window.editCourse = editCourse;
window.deleteCourse = deleteCourse;

async function initFeesPage() {
    await populateStudentSelect(document.getElementById("paymentStudent"));
    await populateCourseSelect(document.getElementById("paymentCourse"));

    const dateInput = document.getElementById("paymentDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    document.getElementById("paymentStudent")?.addEventListener("change", () => {
        const selected = allStudents.find((student) => student.name === document.getElementById("paymentStudent").value);
        if (selected) document.getElementById("paymentCourse").value = selected.course;
    });

    await loadPaymentsFromAPI();

    document.getElementById("paymentForm")?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const selectedStudent = allStudents.find((student) => student.name === document.getElementById("paymentStudent").value);

        const payment = {
            student: document.getElementById("paymentStudent").value,
            studentId: selectedStudent?._id,
            course: document.getElementById("paymentCourse").value,
            amount: Number(document.getElementById("paymentAmount").value),
            method: document.getElementById("paymentMethod").value,
            date: document.getElementById("paymentDate").value,
            status: document.getElementById("paymentStatus").value
        };

        await apiRequest("/payments", {
            method: "POST",
            body: JSON.stringify(payment)
        });

        event.target.reset();
        dateInput.value = new Date().toISOString().split("T")[0];
        await loadPaymentsFromAPI();
    });
}

async function loadPaymentsFromAPI() {
    allPayments = await apiRequest("/payments");
    renderPaymentsTable();
}

function renderPaymentsTable() {
    const tbody = document.getElementById("paymentsTableBody");
    if (!tbody) return;

    if (!allPayments.length) {
        tbody.innerHTML = emptyTableRow("No payments have been recorded yet.", 6);
        return;
    }

    tbody.innerHTML = allPayments.map((payment) => `
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

async function initAttendancePage() {
    const dateInput = document.getElementById("attendanceDate");
    dateInput.value = new Date().toISOString().split("T")[0];

    allStudents = await apiRequest("/students");
    await loadAttendanceDraft(dateInput.value);
    renderAttendanceTable();
    await renderAttendanceHistory();

    dateInput.addEventListener("change", async () => {
        await loadAttendanceDraft(dateInput.value);
        renderAttendanceTable();
    });

    document.getElementById("submitAttendanceBtn")?.addEventListener("click", submitAttendance);
}

async function loadAttendanceDraft(date) {
    attendanceDraft = {};
    hideAttendanceMessage();

    try {
        const sheet = await apiRequest(`/attendance/${date}`);
        sheet.records.forEach((record) => {
            const studentId = record.student?._id || record.student;
            attendanceDraft[studentId] = record.status;
        });
    } catch {
        attendanceDraft = {};
    }
}

function renderAttendanceTable() {
    const tbody = document.getElementById("attendanceTableBody");
    const date = document.getElementById("attendanceDate").value;

    if (!allStudents.length) {
        tbody.innerHTML = emptyTableRow("No students available for attendance.", 4);
        return;
    }

    tbody.innerHTML = allStudents.map((student) => {
        const status = attendanceDraft[student._id] || "Pending";
        return `
            <tr>
                <td>${student.name}</td>
                <td>${student.course}</td>
                <td>${statusBadge(status)}</td>
                <td class="text-end">
                    <div class="attendance-actions">
                        <button class="btn btn-sm btn-outline-success" onclick="setAttendance('${student._id}', 'Present')">Present</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="setAttendance('${student._id}', 'Absent')">Absent</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    renderAttendanceSummary(date);
}

function setAttendance(studentId, status) {
    attendanceDraft[studentId] = status;
    hideAttendanceMessage();
    renderAttendanceTable();
}

window.setAttendance = setAttendance;

async function submitAttendance() {
    const date = document.getElementById("attendanceDate").value;
    if (!date) return;

    const records = allStudents.map((student) => ({
        student: student._id,
        studentName: student.name,
        course: student.course,
        status: attendanceDraft[student._id] || "Pending"
    }));

    await apiRequest("/attendance", {
        method: "POST",
        body: JSON.stringify({ date, records })
    });

    showAttendanceMessage(`Saved for ${formatDate(date)}.`);
    renderAttendanceTable();
    await renderAttendanceHistory();
}

function renderAttendanceSummary(date) {
    const presentCount = allStudents.filter((student) => attendanceDraft[student._id] === "Present").length;
    const absentCount = allStudents.filter((student) => attendanceDraft[student._id] === "Absent").length;
    const pendingCount = Math.max(allStudents.length - presentCount - absentCount, 0);

    document.getElementById("attendanceSummary").innerHTML = `
        <div class="attendance-summary-card">
            <h3>${allStudents.length}</h3>
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

async function renderAttendanceHistory() {
    const historyBody = document.getElementById("attendanceHistoryBody");
    if (!historyBody) return;

    const sheets = await apiRequest("/attendance");

    if (!sheets.length) {
        historyBody.innerHTML = emptyTableRow("No submitted attendance history yet.", 5);
        return;
    }

    historyBody.innerHTML = sheets.map((sheet) => {
        const presentCount = sheet.records.filter((entry) => entry.status === "Present").length;
        const absentCount = sheet.records.filter((entry) => entry.status === "Absent").length;
        const pendingCount = sheet.records.filter((entry) => entry.status === "Pending").length;
        const date = toInputDate(sheet.date);

        return `
            <tr>
                <td>${formatDate(sheet.date)}</td>
                <td>${presentCount}</td>
                <td>${absentCount}</td>
                <td>${pendingCount}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" type="button" onclick="viewAttendanceHistory('${date}')">
                        View Sheet
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

async function viewAttendanceHistory(date) {
    const dateInput = document.getElementById("attendanceDate");
    dateInput.value = date;
    await loadAttendanceDraft(date);
    renderAttendanceTable();
    showAttendanceMessage(`Showing saved sheet for ${formatDate(date)}.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

window.viewAttendanceHistory = viewAttendanceHistory;

async function initProfilePage() {
    const profile = await apiRequest("/profile");
    setProfileUI(profile);

    document.getElementById("profileName").value = profile.name || "";
    document.getElementById("profileRole").value = profile.role || "";
    document.getElementById("profileEmail").value = profile.email || "";
    document.getElementById("profilePhone").value = profile.phone || "";
    document.getElementById("profileInstitute").value = profile.institute || "";
    document.getElementById("profileLocation").value = profile.location || "";
    document.getElementById("profileBio").value = profile.bio || "";

    document.getElementById("profileForm")?.addEventListener("submit", async (event) => {
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

        const savedProfile = await apiRequest("/profile", {
            method: "PUT",
            body: JSON.stringify(updatedProfile)
        });

        saveSession({
            name: savedProfile.name,
            role: savedProfile.role,
            email: savedProfile.email
        });

        setProfileUI(savedProfile);
        renderNavbar();
        showToast("Profile updated", "success");
    });
}

function setProfileUI(profile) {
    setText("profileNameCard", profile.name || "Admin User");
    setText("profileRoleCard", profile.role || "Administrator");
    setText("profileInstituteCard", profile.institute || "Institute");
}

async function populateCourseSelect(selectElement) {
    if (!selectElement) return;

    allCourses = await apiRequest("/courses");

    if (!allCourses.length) {
        selectElement.innerHTML = `<option value="">No courses available</option>`;
        return;
    }

    selectElement.innerHTML = allCourses.map((course) => `
        <option value="${course.name}">${course.name}</option>
    `).join("");
}

async function populateStudentSelect(selectElement) {
    if (!selectElement) return;

    allStudents = await apiRequest("/students");

    if (!allStudents.length) {
        selectElement.innerHTML = `<option value="">No students available</option>`;
        return;
    }

    selectElement.innerHTML = allStudents.map((student) => `
        <option value="${student.name}">${student.name}</option>
    `).join("");
}

function statusBadge(status) {
    const normalized = String(status || "Pending").toLowerCase();

    const className = {
        active: "status-active",
        paid: "status-paid",
        success: "status-paid",
        present: "status-present",
        pending: "status-pending",
        partial: "status-partial",
        completed: "status-completed",
        inactive: "status-absent",
        absent: "status-absent",
        failed: "status-absent"
    }[normalized] || "status-pending";

    return `<span class="status-badge ${className}">${status || "Pending"}</span>`;
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

function toInputDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
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

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function getStudentExtraDetails() {
    return JSON.parse(localStorage.getItem("erp_student_extra_details") || "{}");
}

function saveStudentExtraDetails(studentId, email, details) {
    const extras = getStudentExtraDetails();
    const cleanDetails = {
        loginPassword: details.password || details.loginPassword || "",
        fatherName: details.fatherName || "",
        motherName: details.motherName || "",
        dateOfBirth: details.dateOfBirth || "",
        category: details.category || "",
        duration: details.duration || "",
        address: details.address || ""
    };

    if (studentId) {
        extras[studentId] = cleanDetails;
    }
    if (email) {
        extras[String(email).toLowerCase()] = cleanDetails;
    }

    localStorage.setItem("erp_student_extra_details", JSON.stringify(extras));
}

function deleteStudentExtraDetails(studentId) {
    if (!studentId) return;

    const extras = getStudentExtraDetails();
    delete extras[studentId];
    localStorage.setItem("erp_student_extra_details", JSON.stringify(extras));
}

function mergeStudentExtraDetails(student) {
    const extras = getStudentExtraDetails();
    const studentId = student?._id || student?.id;
    const email = String(student?.email || "").toLowerCase();
    return {
        ...student,
        ...(extras[email] || {}),
        ...(extras[studentId] || {}),
        loginPassword: student.loginPassword || extras[studentId]?.loginPassword || extras[email]?.loginPassword,
        fatherName: student.fatherName || extras[studentId]?.fatherName || extras[email]?.fatherName,
        motherName: student.motherName || extras[studentId]?.motherName || extras[email]?.motherName,
        dateOfBirth: student.dateOfBirth || extras[studentId]?.dateOfBirth || extras[email]?.dateOfBirth,
        category: student.category || extras[studentId]?.category || extras[email]?.category,
        duration: student.duration || extras[studentId]?.duration || extras[email]?.duration,
        address: student.address || extras[studentId]?.address || extras[email]?.address
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function generateStudentPassword() {
    return `ERP${Math.random().toString(36).slice(2, 8)}`;
}

async function confirmAction(text) {
    if (typeof Swal === "undefined") {
        return window.confirm(text);
    }

    const result = await Swal.fire({
        title: "Are you sure?",
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes"
    });

    return result.isConfirmed;
}

function showToast(text, icon = "success") {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon,
            title: text,
            timer: 1400,
            showConfirmButton: false
        });
    }
}

function showAttendanceMessage(text) {
    const message = document.getElementById("attendanceSaveMessage");
    if (!message) return;

    message.textContent = text;
    message.classList.remove("d-none");
}

function hideAttendanceMessage() {
    const message = document.getElementById("attendanceSaveMessage");
    if (!message) return;

    message.textContent = "";
    message.classList.add("d-none");
}
