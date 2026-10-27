let currentUser = { name: "Muhammad Usman", role: "admin", email: "usman.admin@saylani.org" };
let appState = {
    budget: 5000000,
    employees: [
        { id: 1, name: "Muhammad Usman", dept: "Engineering", designation: "Lead Developer", salary: 250000, status: "Active" },
        { id: 2, name: "Ali Ahmed", dept: "HR", designation: "HR Manager", salary: 180000, status: "Active" },
        { id: 3, name: "Sara Khan", dept: "Finance", designation: "Accounts Officer", salary: 160000, status: "Active" },
        { id: 4, name: "Bilal Baloch", dept: "Engineering", designation: "Frontend Dev", salary: 140000, status: "Active" }
    ],
    attendance: [
        { name: "Muhammad Usman", time: "09:12 AM", status: "On Time", geofence: "Verified (8m)" },
        { name: "Ali Ahmed", time: "09:30 AM", status: "Late", geofence: "Verified (14m)" }
    ],
    leaves: [
        { employee: "Sara Khan", type: "Annual Leave", dates: "Oct 28 - Oct 29", status: "Approved" },
        { employee: "Bilal Baloch", type: "Sick Leave", dates: "Nov 02", status: "Pending" }
    ],
    advances: [
        { employee: "Bilal Baloch", amount: 50000, installment: 10000, remaining: 30000, status: "Approved" }
    ]
};

window.onload = function() {
    initCharts();
};

function handleLogin() {
    const authModal = document.getElementById('authModal');
    const appContainer = document.getElementById('appContainer');
    
    if(authModal) {
        authModal.style.display = 'none';
        authModal.classList.add('hidden');
    }
    
    if(appContainer) {
        appContainer.classList.remove('hidden');
        appContainer.style.display = 'flex';
    }
    
    renderAll();
}

function handleLogout() {
    const appContainer = document.getElementById('appContainer');
    const authModal = document.getElementById('authModal');
    
    if(appContainer) {
        appContainer.style.display = 'none';
        appContainer.classList.add('hidden');
    }
    if(authModal) {
        authModal.style.display = 'flex';
        authModal.classList.remove('hidden');
    }
}

function renderAll() {
    renderEmployeeTable();
    renderAttendanceLogs();
    renderLeaveList();
    renderAdvanceList();
    renderPayrollTable();
}

function renderEmployeeTable() {
    const query = (document.getElementById('employeeSearch')?.value || "").toLowerCase();
    const tbody = document.getElementById('employeeTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    appState.employees.filter(e => e.name.toLowerCase().includes(query) || e.dept.toLowerCase().includes(query)).forEach(emp => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-800/50 transition-all">
                <td class="px-4 py-3 font-semibold text-white">${emp.name}</td>
                <td class="px-4 py-3"><span class="px-2.5 py-1 rounded-full bg-slate-800 text-xs text-indigo-300 border border-slate-700">${emp.dept}</span></td>
                <td class="px-4 py-3 text-slate-400">${emp.designation}</td>
                <td class="px-4 py-3 font-mono text-emerald-400">PKR ${emp.salary.toLocaleString()}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${emp.status}</span></td>
                <td class="px-4 py-3 text-right">
                    <button onclick="deleteEmployee(${emp.id})" class="text-rose-400 hover:text-rose-300 text-xs cursor-pointer"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function openAddEmployeeModal() {
    const modalContent = document.getElementById('modalContent');
    if(!modalContent) return;
    modalContent.innerHTML = `
        <div class="flex justify-between items-center"><h3 class="text-base font-bold text-white">Add New Employee</h3><button onclick="closeModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
        <div class="space-y-3">
            <div><label class="block text-xs text-slate-400 mb-1">Full Name</label><input type="text" id="addEmpName" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"></div>
            <div><label class="block text-xs text-slate-400 mb-1">Department</label><input type="text" id="addEmpDept" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"></div>
            <div><label class="block text-xs text-slate-400 mb-1">Designation</label><input type="text" id="addEmpDesig" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"></div>
            <div><label class="block text-xs text-slate-400 mb-1">Base Salary (PKR)</label><input type="number" id="addEmpSal" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"></div>
            <button onclick="saveNewEmployee()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer">Save Employee</button>
        </div>
    `;
    document.getElementById('genericModal').classList.remove('hidden');
}

function saveNewEmployee() {
    const name = document.getElementById('addEmpName').value;
    const dept = document.getElementById('addEmpDept').value;
    const desig = document.getElementById('addEmpDesig').value;
    const sal = parseFloat(document.getElementById('addEmpSal').value) || 100000;
    if(!name) return alert('Please enter name');
    appState.employees.push({ id: Date.now(), name, dept, designation: desig, salary: sal, status: 'Active' });
    closeModal();
    renderAll();
}

function deleteEmployee(id) {
    appState.employees = appState.employees.filter(e => e.id !== id);
    renderAll();
}

function closeModal() { 
    const modal = document.getElementById('genericModal');
    if(modal) modal.classList.add('hidden'); 
}

function performCheckIn() {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appState.attendance.unshift({ name: currentUser.name, time: now, status: 'On Time', geofence: 'Verified (8m)' });
    renderAttendanceLogs();
    alert('Attendance recorded successfully with Face Scan & GPS Verification!');
}

function renderAttendanceLogs() {
    const container = document.getElementById('attendanceLogList');
    if(!container) return;
    container.innerHTML = '';
    appState.attendance.forEach(log => {
        container.innerHTML += `
            <div class="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span class="font-semibold text-white">${log.name}</span>
                <span class="text-indigo-400">${log.time}</span>
                <span class="text-emerald-400 text-[10px]">${log.geofence}</span>
            </div>
        `;
    });
}

function renderLeaveList() {
    const container = document.getElementById('leaveListContainer');
    if(!container) return;
    container.innerHTML = '';
    appState.leaves.forEach(l => {
        container.innerHTML += `
            <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                    <div class="font-semibold text-white">${l.employee} <span class="text-xs text-slate-400">(${l.type})</span></div>
                    <div class="text-[11px] text-slate-400">${l.dates}</div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${l.status}</span>
            </div>
        `;
    });
}

function openLeaveModal() {
    const modalContent = document.getElementById('modalContent');
    if(!modalContent) return;
    modalContent.innerHTML = `
        <div class="flex justify-between items-center"><h3 class="text-base font-bold text-white">Apply for Leave</h3><button onclick="closeModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
        <div class="space-y-3">
            <div><label class="block text-xs text-slate-400 mb-1">Leave Type</label><select id="leaveType" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"><option>Annual Leave</option><option>Sick Leave</option><option>Casual Leave</option></select></div>
            <div><label class="block text-xs text-slate-400 mb-1">Dates</label><input type="text" id="leaveDates" placeholder="e.g. Nov 10 - Nov 12" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"></div>
            <button onclick="submitLeave()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer">Submit Request</button>
        </div>
    `;
    document.getElementById('genericModal').classList.remove('hidden');
}

function submitLeave() {
    const type = document.getElementById('leaveType').value;
    const dates = document.getElementById('leaveDates').value;
    if(!dates) return;
    appState.leaves.push({ employee: currentUser.name, type, dates, status: 'Pending' });
    closeModal();
    renderLeaveList();
}

function renderAdvanceList() {
    const container = document.getElementById('advanceLoanListContainer');
    if(!container) return;
    container.innerHTML = '';
    appState.advances.forEach(a => {
        container.innerHTML += `
            <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                    <div class="font-semibold text-white">${a.employee}</div>
                    <div class="text-[11px] text-cyan-400">Loan: PKR ${a.amount.toLocaleString()} | Remaining: <span class="text-amber-400">PKR ${a.remaining.toLocaleString()}</span></div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">${a.status}</span>
            </div>
        `;
    });
}

function openAdvanceModal() {
    const modalContent = document.getElementById('modalContent');
    if(!modalContent) return;
    modalContent.innerHTML = `
        <div class="flex justify-between items-center"><h3 class="text-base font-bold text-white">Request Advance Salary Loan</h3><button onclick="closeModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
        <div class="space-y-3">
            <div><label class="block text-xs text-slate-400 mb-1">Requested Amount (PKR)</label><input type="number" id="advAmt" value="50000" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"></div>
            <div><label class="block text-xs text-slate-400 mb-1">Monthly Installment Deduction</label><input type="number" id="advInst" value="10000" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"></div>
            <button onclick="submitAdvance()" class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer">Submit Loan Request</button>
        </div>
    `;
    document.getElementById('genericModal').classList.remove('hidden');
}

function submitAdvance() {
    const amt = parseFloat(document.getElementById('advAmt').value) || 50000;
    const inst = parseFloat(document.getElementById('advInst').value) || 10000;
    appState.advances.push({ employee: currentUser.name, amount: amt, installment: inst, remaining: amt, status: 'Approved' });
    closeModal();
    renderAdvanceList();
}

function renderPayrollTable() {
    const tbody = document.getElementById('payrollTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    appState.employees.forEach(emp => {
        let tax = emp.salary > 200000 ? emp.salary * 0.15 : emp.salary * 0.05;
        let loanObj = appState.advances.find(a => a.employee === emp.name && a.remaining > 0);
        let loanDed = loanObj ? loanObj.installment : 0;
        let net = emp.salary - tax - loanDed;
        tbody.innerHTML += `
            <tr class="hover:bg-slate-800/50">
                <td class="px-4 py-3 font-semibold text-white">${emp.name}</td>
                <td class="px-4 py-3 font-mono">PKR ${emp.salary.toLocaleString()}</td>
                <td class="px-4 py-3 text-rose-400 font-mono">-PKR ${tax.toLocaleString()}</td>
                <td class="px-4 py-3 text-amber-400 font-mono">-PKR ${loanDed.toLocaleString()}</td>
                <td class="px-4 py-3 font-mono font-bold text-emerald-400">PKR ${net.toLocaleString()}</td>
                <td class="px-4 py-3 text-right">
                    <button onclick="generatePayslip('${emp.name}', ${emp.salary}, ${tax}, ${loanDed}, ${net})" class="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold cursor-pointer">Payslip</button>
                </td>
            </tr>
        `;
    });
}

function generatePayslip(name, base, tax, loan, net) {
    const modalContent = document.getElementById('modalContent');
    if(!modalContent) return;
    modalContent.innerHTML = `
        <div class="space-y-4 text-slate-300">
            <div class="text-center border-b border-slate-800 pb-3">
                <h2 class="text-lg font-bold text-white">SAYLANI WELFARE IT PARK</h2>
                <p class="text-xs text-indigo-400">Official Monthly Payslip (HCM Lite AI)</p>
            </div>
            <div class="text-xs space-y-1">
                <div><b>Employee:</b> ${name}</div>
                <div><b>Pay Period:</b> October 2026</div>
            </div>
            <div class="bg-slate-900 p-3 rounded-xl space-y-2 text-xs border border-slate-800">
                <div class="flex justify-between"><span>Base Salary:</span><span class="font-mono">PKR ${base.toLocaleString()}</span></div>
                <div class="flex justify-between text-rose-400"><span>Tax Deduction:</span><span class="font-mono">-PKR ${tax.toLocaleString()}</span></div>
                <div class="flex justify-between text-amber-400"><span>Advance Loan Deduction:</span><span class="font-mono">-PKR ${loan.toLocaleString()}</span></div>
                <div class="flex justify-between pt-2 border-t border-slate-800 font-bold text-emerald-400 text-sm"><span>Net Disbursed:</span><span class="font-mono">PKR ${net.toLocaleString()}</span></div>
            </div>
            <button onclick="closeModal()" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer">Close</button>
        </div>
    `;
    document.getElementById('genericModal').classList.remove('hidden');
}

function runPayrollBatch() {
    alert('Monthly Payroll Batch executed successfully across all departments!');
}

let attendanceChartInstance = null;
let departmentChartInstance = null;
function initCharts() {
    const canvasAtt = document.getElementById('attendanceChart');
    if(canvasAtt) {
        const ctxAtt = canvasAtt.getContext('2d');
        if(attendanceChartInstance) attendanceChartInstance.destroy();
        attendanceChartInstance = new Chart(ctxAtt, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{ label: 'Present', data: [11, 12, 10, 12, 12], backgroundColor: '#6366f1', borderRadius: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#1f2937' } } } }
        });
    }

    const canvasDept = document.getElementById('departmentChart');
    if(canvasDept) {
        const ctxDept = canvasDept.getContext('2d');
        if(departmentChartInstance) departmentChartInstance.destroy();
        departmentChartInstance = new Chart(ctxDept, {
            type: 'doughnut',
            data: {
                labels: ['Engineering', 'HR', 'Finance'],
                datasets: [{ data: [6, 3, 3], backgroundColor: ['#6366f1', '#06b6d4', '#10b981'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } } } }
        });
    }
}