/* ==========================================================
   AURA CRICKET ACADEMY - DASHBOARD CONTROLLER & ANALYTICS
   Chart.js Visualizations, Multi-Role Switcher, CRUD & AI Biomechanics
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Global State with Initial Seed Data
  let academyState = {
    students: [
      { id: 1, name: 'Smriti Mandhana', age: 30, category: 'queen of ccricket', role: 'Top-Order Batsman', coach: 'MS dhoni', attendance: 96.4, feeStatus: 'PAID', jersey: 18, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80' },
      { id: 2, name: 'Deepti Sharma', age: 29, category: 'backbone of india cricket', role: 'Fast Bowler', coach: 'MS dhoni', attendance: 94.2, feeStatus: 'PAID', jersey: 99, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80' },
      { id: 3, name: 'Jasprit Bumrah', age: 32, category: 'king of bowling', role: 'All-Rounder', coach: 'MS dhoni', attendance: 91.8, feeStatus: 'PENDING', jersey: 7, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80' },
      { id: 4, name: 'Rohit Sharma', age: 39, category: 'pull short king', role: 'Batsman', coach: 'MS dhoni', attendance: 95.0, feeStatus: 'PAID', jersey: 12, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
      { id: 5, name: 'vaibhav suryavanshi', age: 15, category: 'Under-15 Elite', role: 'Hitter', coach: 'MS dhoni', attendance: 88.5, feeStatus: 'OVERDUE', jersey: 23, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80' }
    ],
    matches: [
      { id: 1, tournament: 'Aura Champions Trophy 2026', teamA: 'Aura Strikers', teamB: 'Titan Velocity', date: 'Tomorrow, 7:30 PM', venue: 'Aura Arena (Stadium 1)', status: 'SCHEDULED' },
      { id: 2, tournament: 'Elite Night Blitz Cup', teamA: 'Aura Knights XI', teamB: 'Royal Phoenix', date: 'Completed', venue: 'Aura Floodlight Oval', score: '198/4 vs 184/7', result: 'Aura Knights won by 14 runs', status: 'COMPLETED' }
    ]
  };

  // Restore stored state if present
  const savedState = localStorage.getItem('aura_academy_state');
  if (savedState) {
    try {
      academyState = JSON.parse(savedState);
    } catch (e) {
      console.error('Failed to parse saved state', e);
    }
  }

  function saveState() {
    localStorage.setItem('aura_academy_state', JSON.stringify(academyState));
  }

  // 1. ROLE SWITCHING CONTROLLER
  const roleButtons = document.querySelectorAll('.role-pill-btn');
  const viewSections = document.querySelectorAll('.dash-view-section');
  const userRoleText = document.querySelector('.dash-user-role');
  const userNameText = document.querySelector('.dash-user-name');
  const userAvatarImg = document.querySelector('.dash-user-profile img');

  // Check URL param or local session
  const urlParams = new URLSearchParams(window.location.search);
  let activeRole = urlParams.get('role') || 'ADMIN';

  const storedUser = localStorage.getItem('aura_current_user');
  if (storedUser && !urlParams.get('role')) {
    try {
      const parsed = JSON.parse(storedUser);
      activeRole = parsed.role || 'ADMIN';
    } catch (e) {}
  }

  function switchRole(role) {
    activeRole = role.toUpperCase();

    // Update active button
    roleButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-role') === activeRole);
    });

    // Update active view
    viewSections.forEach(section => {
      section.classList.toggle('active', section.getAttribute('id') === `view-${activeRole.toLowerCase()}`);
    });

    // Update Header Avatar & Identity
    if (activeRole === 'ADMIN') {
      if (userNameText) userNameText.innerText = 'Director Vikramaditya Roy';
      if (userRoleText) userRoleText.innerText = 'Academy Director';
      if (userAvatarImg) userAvatarImg.src = 'assets/logo.jpg';
    } else if (activeRole === 'COACH') {
      if (userNameText) userNameText.innerText = 'Ricky Vance';
      if (userRoleText) userRoleText.innerText = 'Head Coach (ICC Level 4)';
      if (userAvatarImg) userAvatarImg.src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80';
    } else if (activeRole === 'STUDENT') {
      if (userNameText) userNameText.innerText = 'Arjun Sharma';
      if (userRoleText) userRoleText.innerText = 'U-19 Captain (#18)';
      if (userAvatarImg) userAvatarImg.src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80';
    }

    // Refresh charts on switch
    initOrUpdateCharts();
    if (window.showToast) {
      window.showToast('Role Switched', `Active Cockpit: ${activeRole}`, 'cyan');
    }
  }

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchRole(btn.getAttribute('data-role'));
    });
  });

  // 2. CHART.JS VISUALIZATIONS
  let revenueChartInstance = null;
  let attendanceChartInstance = null;
  let radarChartInstance = null;
  let matchWinChartInstance = null;

  function initOrUpdateCharts() {
    if (typeof Chart === 'undefined') return;

    // Set Global Chart Defaults for dark theme
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    // Chart 1: Admin Revenue Area Chart
    const revCanvas = document.getElementById('revenueChart');
    if (revCanvas && activeRole === 'ADMIN') {
      if (revenueChartInstance) revenueChartInstance.destroy();
      const ctx = revCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
      gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

      revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep (Live)'],
          datasets: [{
            label: 'Academy Revenue ($ USD)',
            data: [42000, 48500, 56000, 68000, 79500, 94200],
            borderColor: '#00f2fe',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ffd700',
            pointBorderColor: '#050b18',
            pointRadius: 5,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { callback: v => '$' + v.toLocaleString() }
            }
          }
        }
      });
    }

    // Chart 2: Attendance Tracking Bar Chart
    const attCanvas = document.getElementById('attendanceChart');
    if (attCanvas && activeRole === 'ADMIN') {
      if (attendanceChartInstance) attendanceChartInstance.destroy();
      const ctx = attCanvas.getContext('2d');
      attendanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon Nets', 'Tue Biomechanics', 'Wed Match Sim', 'Thu Fielding', 'Fri Strength', 'Sat League'],
          datasets: [{
            label: 'Attendance Rate (%)',
            data: [96, 92, 98, 94, 91, 99],
            backgroundColor: 'rgba(0, 242, 254, 0.7)',
            borderColor: '#00f2fe',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 80, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Chart 3: Student Biomechanics Radar Spider Chart
    const radarCanvas = document.getElementById('skillsRadarChart');
    if (radarCanvas) {
      if (radarChartInstance) radarChartInstance.destroy();
      const ctx = radarCanvas.getContext('2d');
      radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Power Arc (360°)', 'Exit Velocity', 'Footwork Precision', 'Defensive Stability', 'Running Speed (22 yds)', 'Wrist Rotation'],
          datasets: [{
            label: 'Arjun Sharma (Actual)',
            data: [94, 91, 88, 92, 95, 89],
            backgroundColor: 'rgba(0, 242, 254, 0.25)',
            borderColor: '#00f2fe',
            pointBackgroundColor: '#00f2fe',
            pointBorderColor: '#fff',
            pointRadius: 4
          }, {
            label: 'IPL Benchmark Target',
            data: [90, 85, 90, 90, 92, 85],
            backgroundColor: 'rgba(255, 215, 0, 0.15)',
            borderColor: '#ffd700',
            pointBackgroundColor: '#ffd700',
            pointBorderColor: '#fff',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: 'rgba(255,255,255,0.1)' },
              grid: { color: 'rgba(255,255,255,0.08)' },
              pointLabels: { color: '#cbd5e1', font: { size: 11, weight: '600' } },
              ticks: { display: false, max: 100, min: 60 }
            }
          }
        }
      });
    }

    // Chart 4: Match Win Probability Doughnut
    const winCanvas = document.getElementById('winProbChart');
    if (winCanvas) {
      if (matchWinChartInstance) matchWinChartInstance.destroy();
      const ctx = winCanvas.getContext('2d');
      matchWinChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Aura Strikers Win', 'Titan Velocity Win', 'Super Over Tie'],
          datasets: [{
            data: [68, 28, 4],
            backgroundColor: ['#00f2fe', '#f59e0b', '#ec4899'],
            borderColor: '#050b18',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } }
          },
          cutout: '72%'
        }
      });
    }
  }

  // 3. RENDER STUDENT DATA TABLE WITH CRUD
  const studentTableBody = document.getElementById('student-table-body');
  const searchInput = document.getElementById('student-search-input');

  function renderStudentsTable(filterText = '') {
    if (!studentTableBody) return;
    studentTableBody.innerHTML = '';

    const filtered = academyState.students.filter(s => 
      s.name.toLowerCase().includes(filterText.toLowerCase()) ||
      s.role.toLowerCase().includes(filterText.toLowerCase()) ||
      s.category.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      studentTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No student records matched your search.</td></tr>`;
      return;
    }

    filtered.forEach(student => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="user-cell">
            <img src="${student.avatar}" alt="${student.name}">
            <div>
              <strong>${student.name}</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Jersey #${student.jersey} • Age ${student.age}</div>
            </div>
          </div>
        </td>
        <td><span class="badge-cyan" style="font-size: 0.75rem;">${student.category}</span></td>
        <td>${student.role}</td>
        <td>${student.coach}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="color: ${student.attendance >= 90 ? 'var(--green-neon)' : 'var(--gold-primary)'}">${student.attendance}%</strong>
          </div>
        </td>
        <td>
          <span class="status-pill ${student.feeStatus === 'PAID' ? 'status-paid' : 'status-pending'}">
            ${student.feeStatus}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm toggle-fee-btn" data-id="${student.id}" title="Toggle Fee Status">
              <i class="fa-solid fa-receipt"></i>
            </button>
            <button class="btn btn-secondary btn-sm delete-student-btn" data-id="${student.id}" title="Remove Student" style="color: #ff4b4b;">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      studentTableBody.appendChild(tr);
    });

    // Attach row button events
    attachTableRowEvents();
  }

  function attachTableRowEvents() {
    // Toggle Fee
    document.querySelectorAll('.toggle-fee-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const s = academyState.students.find(x => x.id === id);
        if (s) {
          s.feeStatus = s.feeStatus === 'PAID' ? 'PENDING' : 'PAID';
          saveState();
          renderStudentsTable(searchInput?.value || '');
          if (window.showToast) {
            window.showToast('Fee Status Updated', `${s.name}'s invoice marked as ${s.feeStatus}`, s.feeStatus === 'PAID' ? 'success' : 'gold');
          }
        }
      });
    });

    // Delete Student
    document.querySelectorAll('.delete-student-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const s = academyState.students.find(x => x.id === id);
        if (confirm(`Are you sure you want to withdraw ${s?.name || 'this student'} from the academy?`)) {
          academyState.students = academyState.students.filter(x => x.id !== id);
          saveState();
          renderStudentsTable(searchInput?.value || '');
          updateTotalCountKPI();
          if (window.showToast) {
            window.showToast('Record Deleted', `${s?.name} has been withdrawn`, 'error');
          }
        }
      });
    });
  }

  function updateTotalCountKPI() {
    const kpi = document.getElementById('kpi-total-students');
    if (kpi) {
      kpi.innerText = (1048 + academyState.students.length).toString();
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderStudentsTable(e.target.value);
    });
  }

  // 4. ADD STUDENT MODAL
  const addStudentModal = document.getElementById('add-student-modal');
  const openAddStudentBtn = document.getElementById('open-add-student-modal');
  const closeAddStudentBtn = document.getElementById('close-add-student-modal');
  const addStudentForm = document.getElementById('add-student-form');

  if (openAddStudentBtn && addStudentModal) {
    openAddStudentBtn.addEventListener('click', () => {
      addStudentModal.classList.add('active');
    });
  }

  if (closeAddStudentBtn && addStudentModal) {
    closeAddStudentBtn.addEventListener('click', () => {
      addStudentModal.classList.remove('active');
    });
    addStudentModal.addEventListener('click', (e) => {
      if (e.target === addStudentModal) addStudentModal.classList.remove('active');
    });
  }

  if (addStudentForm) {
    addStudentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-student-name')?.value;
      const age = parseInt(document.getElementById('new-student-age')?.value || '17', 10);
      const role = document.getElementById('new-student-role')?.value || 'Top-Order Batsman';
      const category = document.getElementById('new-student-category')?.value || 'Under-19 High Performance';
      const coach = document.getElementById('new-student-coach')?.value || 'Ricky Vance';

      const newStudent = {
        id: Date.now(),
        name: name,
        age: age,
        category: category,
        role: role,
        coach: coach,
        attendance: 100.0,
        feeStatus: 'PAID',
        jersey: Math.floor(Math.random() * 88) + 10,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      };

      academyState.students.unshift(newStudent);
      saveState();
      renderStudentsTable();
      updateTotalCountKPI();

      addStudentModal?.classList.remove('active');
      addStudentForm.reset();

      if (window.showToast) {
        window.showToast('Student Enrolled!', `${name} successfully added to ${category}`, 'success');
      }
    });
  }

  // 5. AI BIOMECHANICS ANALYZER SIMULATOR
  const batSpeedSlider = document.getElementById('slider-bat-speed');
  const elbowAngleSlider = document.getElementById('slider-elbow-angle');
  const displayExitVelocity = document.getElementById('ai-exit-velocity');
  const displayLaunchAngle = document.getElementById('ai-launch-angle');
  const displayFeedback = document.getElementById('ai-feedback-text');

  function calculateBiomechanics() {
    if (!batSpeedSlider || !elbowAngleSlider) return;

    const batSpeed = parseFloat(batSpeedSlider.value);
    const elbowAngle = parseFloat(elbowAngleSlider.value);

    // Sports physics formula simulation
    const exitVel = Math.round(batSpeed * 1.18 + (elbowAngle > 80 && elbowAngle < 95 ? 12 : 4));
    const launchAngle = Math.round((95 - elbowAngle) * 0.6 + 18);

    if (displayExitVelocity) displayExitVelocity.innerText = `${exitVel} km/h`;
    if (displayLaunchAngle) displayLaunchAngle.innerText = `${launchAngle}°`;

    if (displayFeedback) {
      if (elbowAngle >= 85 && elbowAngle <= 92 && batSpeed >= 125) {
        displayFeedback.innerHTML = `<strong>✨ Elite Class Execution:</strong> High-elbow elevation of ${elbowAngle}° provides supreme bat flow through mid-off. Projected carry distance: 88 meters (Six Runs Guaranteed).`;
      } else if (elbowAngle < 80) {
        displayFeedback.innerHTML = `<strong>⚠️ Warning - Slicing Risk:</strong> Elbow dropped to ${elbowAngle}°. Adjust top-hand grip to prevent leading-edge aerial catch to third man.`;
      } else {
        displayFeedback.innerHTML = `<strong>⚡ Solid Contact:</strong> Clean kinetic transfer. Bat speed ${batSpeed} km/h is in top 8% of academy bench percentile.`;
      }
    }
  }

  if (batSpeedSlider && elbowAngleSlider) {
    batSpeedSlider.addEventListener('input', calculateBiomechanics);
    elbowAngleSlider.addEventListener('input', calculateBiomechanics);
    calculateBiomechanics();
  }

  // 6. NOTIFICATION BELL TOGGLE
  const notifBtn = document.getElementById('notif-bell-btn');
  const notifDropdown = document.getElementById('notif-dropdown');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      notifDropdown.classList.remove('active');
    });
  }

  // Initial Boot
  switchRole(activeRole);
  renderStudentsTable();
  updateTotalCountKPI();
});
