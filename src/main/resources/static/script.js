
const API = "/students";

const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const formPanel = document.querySelector(".form-panel");

let students = [];
let filteredStudents = [];
let currentPage = 1;
const pageSize = 5;

// Load students
async function loadStudents() {
    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        students = await response.json();

        updateStats();
        updateCourseFilter();
        applyFilters();

    } catch (error) {
        console.error(error);
        alert("Unable to load students. Check backend.");
    }
}

// Dashboard statistics
function updateStats() {
    document.getElementById("totalStudents").textContent =
        students.length;

    const courses = [...new Set(
        students.map(s => s.course?.trim()).filter(Boolean)
    )];

    document.getElementById("totalCourses").textContent =
        courses.length;

    document.getElementById("totalRecords").textContent =
        students.length;
}

// Course filter
function updateCourseFilter() {
    const filter = document.getElementById("courseFilter");
    const selected = filter.value;

    const courses = [...new Set(
        students.map(s => s.course?.trim()).filter(Boolean)
    )].sort();

    filter.innerHTML = '<option value="all">All Courses</option>';

    courses.forEach(course => {
        const option = document.createElement("option");
        option.value = course;
        option.textContent = course;
        filter.appendChild(option);
    });

    if (courses.includes(selected)) {
        filter.value = selected;
    }
}

// Search and filter
function applyFilters() {
    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const selectedCourse =
        document.getElementById("courseFilter").value;

    filteredStudents = students.filter(student => {

        const name = (student.name || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        const course = (student.course || "").toLowerCase();

        const matchesSearch =
            name.includes(search) ||
            email.includes(search) ||
            course.includes(search);

        const matchesCourse =
            selectedCourse === "all" ||
            student.course === selectedCourse;

        return matchesSearch && matchesCourse;
    });

    currentPage = 1;
    renderStudents();
}

// Render students
function renderStudents() {
    table.innerHTML = "";

    const totalPages = Math.max(
        1,
        Math.ceil(filteredStudents.length / pageSize)
    );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * pageSize;
    const pageStudents = filteredStudents.slice(
        start,
        start + pageSize
    );

    pageStudents.forEach(student => {

        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = student.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const emailCell = document.createElement("td");
        emailCell.textContent = student.email;

        const courseCell = document.createElement("td");

        const badge = document.createElement("span");
        badge.className = "course-badge";
        badge.textContent = student.course;

        courseCell.appendChild(badge);

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.onclick = () => editStudent(student.id);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteStudent(student.id);

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(courseCell);
        row.appendChild(actionCell);

        table.appendChild(row);
    });

    document.getElementById("emptyMessage").style.display =
        pageStudents.length === 0 ? "block" : "none";

    document.getElementById("pageInfo").textContent =
        `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevBtn").disabled =
        currentPage === 1;

    document.getElementById("nextBtn").disabled =
        currentPage === totalPages;
}

// Pagination
function nextPage() {
    const totalPages = Math.ceil(
        filteredStudents.length / pageSize
    );

    if (currentPage < totalPages) {
        currentPage++;
        renderStudents();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderStudents();
    }
}

// Open form
function openForm() {
    formPanel.style.display = "block";
    document.getElementById("formTitle").textContent =
        "Add New Student";

    document.getElementById("submitBtn").textContent =
        "Add Student";

    document.getElementById("studentId").value = "";

    form.reset();

    formPanel.scrollIntoView({
        behavior: "smooth"
    });
}

// Close form
function closeForm() {
    formPanel.style.display = "none";
    form.reset();
    document.getElementById("studentId").value = "";
}

// Edit student
function editStudent(id) {
    const student = students.find(s => s.id === id);

    if (!student) return;

    openForm();

    document.getElementById("studentId").value =
        student.id;

    document.getElementById("name").value =
        student.name;

    document.getElementById("email").value =
        student.email;

    document.getElementById("course").value =
        student.course;

    document.getElementById("formTitle").textContent =
        "Edit Student";

    document.getElementById("submitBtn").textContent =
        "Update Student";
}

// Add and Update
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const id = document.getElementById("studentId").value;

    const student = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value.trim()
    };

    if (!student.name || !student.email || !student.course) {
        alert("Please fill all fields");
        return;
    }

    try {

        let response;

        if (id) {

            response = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });

        } else {

            response = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });
        }

        if (!response.ok) {
            throw new Error("Operation failed");
        }

        alert(id
            ? "Student updated successfully!"
            : "Student added successfully!");

        closeForm();
        await loadStudents();

    } catch (error) {
        console.error(error);
        alert("Something went wrong!");
    }
});

// Delete
async function deleteStudent(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        alert("Student deleted successfully!");

        await loadStudents();

    } catch (error) {
        console.error(error);
        alert("Unable to delete student");
    }
}

// Export CSV
function exportCSV() {

    if (filteredStudents.length === 0) {
        alert("No students to export");
        return;
    }

    const headers = ["ID", "Name", "Email", "Course"];

    const rows = filteredStudents.map(student => [
        student.id,
        student.name,
        student.email,
        student.course
    ]);

    const csv = [headers, ...rows]
        .map(row =>
            row.map(value =>
                `"${String(value ?? "").replace(/"/g, '""')}"`
            ).join(",")
        )
        .join("\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();

    URL.revokeObjectURL(url);
}

// Dark mode
document.getElementById("themeBtn")
    .addEventListener("click", function() {

        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        this.textContent = isDark
            ? "☀ Light Mode"
            : "◐ Toggle Theme";
    });

// Initial load
loadStudents();

