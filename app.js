
const $ = (id) => document.getElementById(id);
const KEY = "hcmLiteData";

const initial = {
  company: {
    name: "HCM Lite",
    location: "Karachi, Pakistan",
    start: "09:00",
    end: "17:00"
  },
  employees: [],
  attendance: [],
  leaves: [],
  payroll: []
};

let data;
try {
  data = { ...initial, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
} catch {
  data = { ...initial };
}

const page = document.body.dataset.page || "dashboard";
const pages = [
  ["dashboard", "index.html", "▦", "Dashboard"],
  ["employees", "employees.html", "♙", "Employees"],
  ["attendance", "attendance.html", "◷", "Attendance"],
  ["leaves", "leaves.html", "▤", "Leave Management"],
  ["payroll", "payroll.html", "＄", "Payroll"],
  ["ai", "ai-assistant.html", "✧", "AI Assistant"],
  ["settings", "settings.html", "⚙", "Settings"]
];

function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
  render();
}

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));
}

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateText(value) {
  if (!value) return "—";
  return new Date(value + "T12:00:00").toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function money(value) {
  return "PKR " + Number(value || 0).toLocaleString("en-PK");
}

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2)
    .map(word => word[0] || "").join("").toUpperCase();
}

function notify(message) {
  let box = $("toast");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast";
    box.style.cssText =
      "position:fixed;bottom:20px;right:20px;padding:14px 18px;background:#14213d;color:white;border-radius:10px;z-index:99;box-shadow:0 8px 25px #0002";
    document.body.appendChild(box);
  }
  box.textContent = message;
  box.hidden = false;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => box.hidden = true, 2800);
}

function heading(kicker, title, description, action = "") {
  return `
    <div class="page-head">
      <div>
        <div class="eyebrow">${kicker}</div>
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
      <div>${action}</div>
    </div>`;
}

function button(label, action, primary = false) {
  return `<button class="btn ${primary ? "btn-primary" : ""}" onclick="${action}">${label}</button>`;
}

function status(value) {
  const cls = value === "Approved" || value === "Active" || value === "Present"
    ? "" : value === "Rejected" ? "rejected" : "pending";
  return `<span class="badge ${cls}">${esc(value)}</span>`;
}

function employeeName(employeeId) {
  return data.employees.find(e => e.id === employeeId)?.name || "Unknown employee";
}

function person(name, detail) {
  return `<div class="user">
    <span class="avatar">${esc(initials(name))}</span>
    <span>${esc(name)}<br><small class="muted">${esc(detail || "")}</small></span>
  </div>`;
}

function table(headers, rows, message = "No records yet.") {
  return `<div class="table-wrap"><table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.length ? rows.join("") :
      `<tr><td colspan="${headers.length}"><div class="empty">${message}</div></td></tr>`}
    </tbody>
  </table></div>`;
}

function layout(content) {
  const current = pages.find(p => p[0] === page) || pages[0];
  $("app").innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-icon">H</span><span>HCM Lite</span></div>
        <div class="nav-label">WORKSPACE</div>
        <nav class="nav">
          ${pages.map(p => `<a href="${p[1]}" class="${p[0] === page ? "active" : ""}">
            <span>${p[2]}</span>${p[3]}</a>`).join("")}
        </nav>
        <div style="position:absolute;bottom:25px;left:25px;color:#9aacc9;font-size:11px">
          People, simplified · Demo
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div><strong>${current[3]}</strong><div class="muted">${esc(data.company.name)}</div></div>
          <div class="user"><span class="avatar">AD</span><span>Admin<br><small class="muted">Demo mode</small></span></div>
        </header>
        <section class="content">${content}</section>
      </main>
    </div>`;
}

function dashboard() {
  const present = data.attendance.filter(a =>
    a.date === today() && a.in && !a.out).length;
  const pending = data.leaves.filter(l => l.status === "Pending").length;
  const net = data.payroll.reduce((sum, p) => sum + Number(p.net), 0);

  const stats = [
    ["Total employees", data.employees.length, "♙"],
    ["Checked in today", present, "◷"],
    ["Pending leaves", pending, "▤"],
    ["Net payroll records", money(net), "＄"]
  ];

  const rows = data.employees.slice(-5).reverse().map(e => `
    <tr><td>${person(e.name, e.role)}</td>
    <td>${esc(e.department)}</td><td>${esc(e.email)}</td>
    <td>${status("Active")}</td></tr>`);

  return heading("OVERVIEW", "Good day, Admin 👋",
    "Here is your organization at a glance.",
    button("+ Add employee", "openEmployeeForm()", true)) +
    `<div class="grid stats">
      ${stats.map(s => `<div class="card">
        <span class="stat-icon">${s[2]}</span>
        <div class="stat-label">${s[0]}</div>
        <div class="stat-value">${s[1]}</div>
        <div class="stat-note">Current saved records</div>
      </div>`).join("")}
    </div>
    <div class="grid dashboard-grid">
      <div class="panel">
        <div class="panel-title">Welcome to HCM Lite</div>
        <div class="panel-subtitle">Your simple HR workspace</div>
        <p class="muted">Start by adding employees, recording attendance,
        reviewing leave requests and preparing payroll.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${button("Add employee", "openEmployeeForm()", true)}
          <a class="btn" href="attendance.html">Attendance</a>
          <a class="btn" href="leaves.html">Leave requests</a>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">Today's snapshot</div>
        <div class="panel-subtitle">${dateText(today())}</div>
        <p>Employees: <strong>${data.employees.length}</strong></p>
        <p>Checked in: <strong>${present}</strong></p>
        <p>Pending leaves: <strong>${pending}</strong></p>
        <p>Payroll records: <strong>${data.payroll.length}</strong></p>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title">Recently added employees</div>
      <div class="panel-subtitle">Latest employee records</div>
      ${table(["Employee", "Department", "Email", "Status"], rows)}
    </div>`;
}

function employees() {
  const rows = data.employees.map(e => `
    <tr><td>${person(e.name, e.role)}</td>
    <td>${esc(e.department)}</td><td>${esc(e.email)}</td>
    <td>${esc(e.phone || "—")}</td><td>${dateText(e.joinDate)}</td>
    <td>${button("Remove", `removeEmployee('${e.id}')`)}</td></tr>`);

  return heading("PEOPLE", "Employees", "Manage employee records.",
    button("+ Add employee", "openEmployeeForm()", true)) +
    `<div class="panel">
      <div class="toolbar">
        <input class="search" id="searchEmployee" placeholder="Search employees..." oninput="filterEmployeeRows()">
        <button class="btn" onclick="exportCSV()">Export CSV</button>
      </div>
      <div id="employeeRows">${table(
        ["Employee", "Department", "Email", "Phone", "Join date", "Action"],
        rows, "No employees added. Click Add employee to begin."
      )}</div>
    </div>`;
}

function filterEmployeeRows() {
  const q = ($("searchEmployee")?.value || "").toLowerCase();
  const list = data.employees.filter(e =>
    `${e.name} ${e.email} ${e.department}`.toLowerCase().includes(q));
  const rows = list.map(e => `
    <tr><td>${person(e.name, e.role)}</td><td>${esc(e.department)}</td>
    <td>${esc(e.email)}</td><td>${esc(e.phone || "—")}</td>
    <td>${dateText(e.joinDate)}</td>
    <td>${button("Remove", `removeEmployee('${e.id}')`)}</td></tr>`);
  $("employeeRows").innerHTML = table(
    ["Employee", "Department", "Email", "Phone", "Join date", "Action"],
    rows, "No matching employees.");
}

function openEmployeeForm() {
  const html = `
    <div class="panel" style="margin-bottom:20px">
      <div class="panel-title">Add a new employee</div>
      <div class="panel-subtitle">Fields marked * are required.</div>
      <form id="employeeForm" class="form-grid">
        <div class="form-field"><label>Full name *</label><input name="name" required></div>
        <div class="form-field"><label>Job title</label><input name="role" placeholder="HR Officer"></div>
        <div class="form-field"><label>Email *</label><input name="email" type="email" required></div>
        <div class="form-field"><label>Phone</label><input name="phone"></div>
        <div class="form-field"><label>Department</label>
          <select name="department"><option>Human Resources</option><option>Engineering</option>
          <option>Finance</option><option>Marketing</option><option>Operations</option></select>
        </div>
        <div class="form-field"><label>Joining date</label><input name="joinDate" type="date" value="${today()}"></div>
        <div class="form-field full"><button class="btn btn-primary">Save employee</button></div>
      </form>
    </div>`;
  const target = document.querySelector(".content");
  target.insertAdjacentHTML("afterbegin", html);
  $("employeeForm").addEventListener("submit", addEmployee);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addEmployee(event) {
  event.preventDefault();
  const f = new FormData(event.target);
  const email = String(f.get("email")).trim().toLowerCase();
  if (data.employees.some(e => e.email.toLowerCase() === email)) {
    notify("This email is already registered.");
    return;
  }
  data.employees.push({
    id: id(), name: String(f.get("name")).trim(),
    role: String(f.get("role")).trim() || "Employee",
    email, phone: String(f.get("phone")).trim(),
    department: String(f.get("department")),
    joinDate: String(f.get("joinDate")) || today()
  });
  save();
  notify("Employee added successfully.");
}

function removeEmployee(employeeId) {
  if (!confirm("Remove this employee?")) return;
  data.employees = data.employees.filter(e => e.id !== employeeId);
  save();
  notify("Employee removed.");
}

function attendance() {
  const rows = data.attendance.slice().reverse().map(a => `
    <tr><td>${person(employeeName(a.employeeId), "Employee")}</td>
    <td>${dateText(a.date)}</td><td>${esc(a.in || "—")}</td>
    <td>${esc(a.out || "—")}</td><td>${status(a.out ? "Present" : "Pending")}</td></tr>`);

  return heading("TIME & ATTENDANCE", "Attendance",
    "Record employee check-in and check-out times.") +
    `<div class="panel">
      <div class="panel-title">Record attendance</div>
      <div class="panel-subtitle">Select an employee and action.</div>
      ${data.employees.length ? `
      <div class="form-grid">
        <div class="form-field"><label>Employee</label>
          <select id="attendanceEmployee">${data.employees.map(e =>
            `<option value="${e.id}">${esc(e.name)}</option>`).join("")}</select>
        </div>
        <div class="form-field"><label>Action</label>
          <select id="attendanceAction"><option value="in">Check in</option>
          <option value="out">Check out</option></select>
        </div>
      </div>
      <div style="margin-top:16px">${button("Save attendance", "recordAttendance()", true)}</div>
      ` : `<div class="empty">Add employees before recording attendance.</div>`}
    </div>
    <div style="height:20px"></div>
    <div class="panel"><div class="panel-title">Attendance history</div>
    <div class="panel-subtitle">Saved attendance records</div>
    ${table(["Employee", "Date", "Check in", "Check out", "Status"], rows)}</div>`;
}

function recordAttendance() {
  const employeeId = $("attendanceEmployee")?.value;
  const action = $("attendanceAction")?.value;
  if (!employeeId) return;
  let record = data.attendance.find(a => a.employeeId === employeeId && a.date === today());
  const time = new Date().toLocaleTimeString("en-PK", {
    hour: "2-digit", minute: "2-digit", hour12: false
  });
  if (action === "in") {
    if (record?.in) return notify("Already checked in today.");
    if (!record) {
      record = { id: id(), employeeId, date: today(), in: time, out: "" };
      data.attendance.push(record);
    } else record.in = time;
  } else {
    if (!record?.in) return notify("Check in before checking out.");
    if (record.out) return notify("Already checked out today.");
    record.out = time;
  }
  save();
  notify("Attendance saved.");
}

function leaves() {
  const rows = data.leaves.slice().reverse().map(l => `
    <tr><td>${person(employeeName(l.employeeId), "Employee")}</td>
    <td>${esc(l.type)}</td><td>${dateText(l.from)}</td><td>${dateText(l.to)}</td>
    <td>${esc(l.reason)}</td><td>${status(l.status)}</td><td>
    ${l.status === "Pending" ?
      button("Approve", `decideLeave('${l.id}','Approved')`, true) + " " +
      button("Reject", `decideLeave('${l.id}','Rejected')`) : "—"}
    </td></tr>`);

  return heading("TIME OFF", "Leave management",
    "Submit and review employee leave requests.",
    button("+ New request", "openLeaveForm()", true)) +
    `<div class="grid stat-grid-small">
      <div class="card"><span class="muted">Total requests</span><strong>${data.leaves.length}</strong></div>
      <div class="card"><span class="muted">Pending</span><strong>${data.leaves.filter(l => l.status === "Pending").length}</strong></div>
      <div class="card"><span class="muted">Approved</span><strong>${data.leaves.filter(l => l.status === "Approved").length}</strong></div>
    </div>
    <div class="panel"><div class="panel-title">Leave requests</div>
    <div class="panel-subtitle">Pending requests can be approved or rejected.</div>
    ${table(["Employee", "Type", "From", "To", "Reason", "Status", "Action"], rows)}</div>`;
}

function openLeaveForm() {
  if (!data.employees.length) return notify("Please add an employee first.");
  document.querySelector(".content").insertAdjacentHTML("afterbegin", `
    <div class="panel" style="margin-bottom:20px">
      <div class="panel-title">New leave request</div><br>
      <form id="leaveForm" class="form-grid">
        <div class="form-field full"><label>Employee</label><select name="employeeId">
          ${data.employees.map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join("")}
        </select></div>
        <div class="form-field"><label>Leave type</label><select name="type">
          <option>Annual leave</option><option>Sick leave</option>
          <option>Personal leave</option><option>Unpaid leave</option>
        </select></div>
        <div class="form-field"><label>From</label><input type="date" name="from" required value="${today()}"></div>
        <div class="form-field"><label>To</label><input type="date" name="to" required value="${today()}"></div>
        <div class="form-field full"><label>Reason</label><textarea name="reason" required></textarea></div>
        <div class="form-field full"><button class="btn btn-primary">Submit request</button></div>
      </form>
    </div>`);
  $("leaveForm").addEventListener("submit", addLeave);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addLeave(event) {
  event.preventDefault();
  const f = new FormData(event.target);
  const from = String(f.get("from")), to = String(f.get("to"));
  if (to < from) return notify("End date cannot be before start date.");
  data.leaves.push({
    id: id(), employeeId: String(f.get("employeeId")),
    type: String(f.get("type")), from, to,
    reason: String(f.get("reason")).trim(), status: "Pending"
  });
  save();
  notify("Leave request submitted.");
}

function decideLeave(leaveId, decision) {
  const item = data.leaves.find(l => l.id === leaveId);
  if (!item) return;
  item.status = decision;
  save();
  notify("Leave request " + decision.toLowerCase() + ".");
}

function payroll() {
  const total = data.payroll.reduce((sum, p) => sum + p.net, 0);
  const rows = data.payroll.slice().reverse().map(p => `
    <tr><td>${person(employeeName(p.employeeId), p.period)}</td>
    <td>${money(p.salary)}</td><td>${money(p.deduction)}</td>
    <td><strong>${money(p.net)}</strong></td><td>${status(p.status)}</td>
    <td>${button("Print", `printPayslip('${p.id}')`)}</td></tr>`);

  return heading("COMPENSATION", "Payroll",
    "Prepare salary summaries and payslip previews.",
    button("+ Create payroll", "openPayrollForm()", true)) +
    `<div class="grid stat-grid-small">
      <div class="card"><span class="muted">Saved payrolls</span><strong>${data.payroll.length}</strong></div>
      <div class="card"><span class="muted">Net total</span><strong>${money(total)}</strong></div>
      <div class="card"><span class="muted">Status</span><strong>Demo</strong></div>
    </div>
    <div class="notice">Demo calculation only. Real payroll requires verified tax slabs, benefits and company rules.</div>
    <div class="panel"><div class="panel-title">Payroll records</div><br>
    ${table(["Employee / Period", "Gross", "Deductions", "Net pay", "Status", "Payslip"], rows)}</div>`;
}

function openPayrollForm() {
  if (!data.employees.length) return notify("Please add an employee first.");
  document.querySelector(".content").insertAdjacentHTML("afterbegin", `
    <div class="panel" style="margin-bottom:20px">
      <div class="panel-title">Create payroll</div><br>
      <form id="payrollForm" class="form-grid">
        <div class="form-field full"><label>Employee</label><select name="employeeId">
          ${data.employees.map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join("")}
        </select></div>
        <div class="form-field"><label>Pay period</label><input name="period" required placeholder="October 2026"></div>
        <div class="form-field"><label>Gross salary (PKR)</label><input name="salary" type="number" min="0" required></div>
        <div class="form-field"><label>Deductions (PKR)</label><input name="deduction" type="number" min="0" value="0"></div>
        <div class="form-field full"><button class="btn btn-primary">Save payroll draft</button></div>
      </form>
    </div>`);
  $("payrollForm").addEventListener("submit", addPayroll);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addPayroll(event) {
  event.preventDefault();
  const f = new FormData(event.target);
  const salary = Number(f.get("salary"));
  const deduction = Number(f.get("deduction") || 0);
  if (deduction > salary) return notify("Deductions cannot exceed salary.");
  data.payroll.push({
    id: id(), employeeId: String(f.get("employeeId")),
    period: String(f.get("period")), salary, deduction,
    net: salary - deduction, status: "Draft"
  });
  save();
  notify("Payroll draft saved.");
}

function printPayslip(payrollId) {
  const p = data.payroll.find(x => x.id === payrollId);
  if (!p) return;
  const html = `<html><head><title>Payslip</title>
    <style>body{font:16px Arial;padding:40px;max-width:650px;margin:auto}
    h1{color:#14213d}.row{display:flex;justify-content:space-between;padding:14px;border-bottom:1px solid #ddd}</style>
    </head><body><h1>${esc(data.company.name)}</h1><h2>Payslip</h2>
    <p>Employee: ${esc(employeeName(p.employeeId))}</p><p>Period: ${esc(p.period)}</p>
    <div class="row"><span>Gross salary</span><strong>${money(p.salary)}</strong></div>
    <div class="row"><span>Deductions</span><strong>${money(p.deduction)}</strong></div>
    <div class="row"><span>Net pay</span><strong>${money(p.net)}</strong></div>
    <script>window.onload=()=>window.print()<\/script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return notify("Allow pop-ups to print the payslip.");
  w.document.write(html);
  w.document.close();
}

function ai() {
  return heading("AI COPILOT", "HR Assistant",
    "Ask questions about your locally saved demo records.") +
    `<div class="notice"><strong>Demo assistant:</strong> this is not connected to an external AI API. Answers are based on the data in this browser only.</div>
    <div class="panel">
      <div class="panel-title">HCM AI Copilot ✦</div>
      <div class="panel-subtitle">Try: How many employees? Who is on leave today?</div>
      <div id="chat" class="chat">
        <div class="message">Hello! Ask me about employee counts, attendance, leaves or the dashboard.</div>
      </div>
      <form id="chatForm" class="chat-form">
        <input id="chatInput" placeholder="Ask your HR question..." required>
        <button class="btn btn-primary">Send</button>
      </form>
    </div>`;
}

function sendChat(event) {
  event.preventDefault();
  const q = $("chatInput").value.trim();
  const box = $("chat");
  const user = document.createElement("div");
  user.className = "message user";
  user.textContent = q;
  box.appendChild(user);

  const lower = q.toLowerCase();
  let answer;

  if (lower.includes("how many") && lower.includes("employee")) {
    answer = `There are ${data.employees.length} employee record(s) saved in this browser.`;
  } else if (lower.includes("leave") && lower.includes("today")) {
    const list = data.leaves.filter(l =>
      l.status === "Approved" && l.from <= today() && l.to >= today());
    answer = list.length
      ? "Approved leave today: " + list.map(l => employeeName(l.employeeId)).join(", ")
      : "No approved leave records for today were found in this browser.";
  } else if (lower.includes("attendance") || lower.includes("check in")) {
    const count = data.attendance.filter(a => a.date === today() && a.in && !a.out).length;
    answer = `${count} employee(s) are currently checked in today.`;
  } else if (lower.includes("summar") || lower.includes("dashboard")) {
    answer = `Dashboard summary: ${data.employees.length} employees, ` +
      `${data.leaves.filter(l => l.status === "Pending").length} pending leave request(s), ` +
      `${data.attendance.filter(a => a.date === today()).length} attendance record(s) today, ` +
      `net payroll total ${money(data.payroll.reduce((s, p) => s + p.net, 0))}.`;
  } else if (lower.includes("leave")) {
    answer = "Open Leave Management, click New request, select the employee, dates and reason, then submit. A reviewer can approve or reject the request.";
  } else {
    answer = "Try asking: How many employees are registered? Who is on leave today? Summarize the dashboard.";
  }

  const reply = document.createElement("div");
  reply.className = "message";
  reply.textContent = answer;
  box.appendChild(reply);
  $("chatInput").value = "";
  box.scrollTop = box.scrollHeight;
}

function settings() {
  return heading("WORKSPACE", "Settings",
    "Manage your company profile and office timing.",
    button("Save settings", "saveSettings()", true)) +
    `<div class="panel">
      <div class="panel-title">Organization profile</div>
      <div class="panel-subtitle">Basic company details</div>
      <form id="settingsForm" class="form-grid">
        <div class="form-field full"><label>Company name</label>
          <input name="name" value="${esc(data.company.name)}" required></div>
        <div class="form-field full"><label>Office location</label>
          <input name="location" value="${esc(data.company.location)}"></div>
        <div class="form-field"><label>Office start time</label>
          <input name="start" type="time" value="${esc(data.company.start)}"></div>
        <div class="form-field"><label>Office end time</label>
          <input name="end" type="time" value="${esc(data.company.end)}"></div>
        <div class="form-field full"><button class="btn btn-primary">Save changes</button></div>
      </form>
    </div>
    <div style="height:20px"></div>
    <div class="panel"><div class="panel-title">Demo data</div>
      <p class="muted">Records are stored only in this browser. Reset will delete them from this browser.</p>
      ${button("Export JSON", "exportData()")}
      ${button("Reset demo data", "resetData()")}
    </div>`;
}

function saveSettings() {
  const f = $("settingsForm");
  if (!f) return;
  const fd = new FormData(f);
  data.company = {
    name: String(fd.get("name")).trim(),
    location: String(fd.get("location")).trim(),
    start: String(fd.get("start")),
    end: String(fd.get("end"))
  };
  save();
  notify("Settings saved.");
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hcm-lite-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV() {
  const rows = [
    ["Name", "Role", "Email", "Phone", "Department", "Join date"],
    ...data.employees.map(e => [e.name, e.role, e.email, e.phone, e.department, e.joinDate])
  ];
  const csv = rows.map(row => row.map(v =>
    `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "hcm-lite-employees.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function resetData() {
  if (!confirm("Delete all demo records saved in this browser?")) return;
  data = {
    company: { ...initial.company },
    employees: [], attendance: [], leaves: [], payroll: []
  };
  save();
  notify("Demo records cleared.");
}

function render() {
  const views = { dashboard, employees, attendance, leaves, payroll, ai, settings };
  layout((views[page] || dashboard)());

  if (page === "ai") $("chatForm")?.addEventListener("submit", sendChat);
  if (page === "settings") $("settingsForm")?.addEventListener("submit", e => {
    e.preventDefault();
    saveSettings();
  });
}

render();
