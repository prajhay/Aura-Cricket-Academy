/* ==========================================================
   AURA CRICKET ACADEMY - AUTHENTICATION & ROLE MANAGEMENT
   Role Switching, 1-Click Test Credentials, Session Persistence
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const roleButtons = document.querySelectorAll('.auth-role-btn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const quickFillButtons = document.querySelectorAll('.quick-fill-btn');
  let selectedRole = 'ADMIN';

  // Demo Credentials Database
  const DEMO_ACCOUNTS = {
    ADMIN: {
      username: 'admin_aura',
      password: 'admin@123',
      name: 'Director Vikramaditya Roy',
      role: 'ADMIN',
      avatar: 'assets/logo.jpg',
      tag: 'Academy Director'
    },
    COACH: {
      username: 'coach_aura',
      password: 'coach@123',
      name: 'Ricky Vance (Head Coach)',
      role: 'COACH',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      tag: 'ICC Master Coach'
    },
    STUDENT: {
       username: 'student_aura',
      password: 'student@123',
      name: 'Arjun Sharma (U-19 Captain)',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      tag: 'Top-Order Batsman'
    }
  };

  // Role Tab Selection
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.getAttribute('data-role');
    });
  });

  // 1-Click Quick Fill Buttons
  quickFillButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.getAttribute('data-role');
      const creds = DEMO_ACCOUNTS[role];
      if (creds) {
        selectedRole = role;
        roleButtons.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-role') === role);
        });
        if (usernameInput) usernameInput.value = creds.username;
        if (passwordInput) passwordInput.value = creds.password;
        
        // Visual indicator
        btn.classList.add('flash');
        setTimeout(() => btn.classList.remove('flash'), 300);

        if (window.showToast) {
          window.showToast('Credentials Loaded', `Signed in preview as ${creds.name}`, 'cyan');
        }
      }
    });
  });

  // Handle Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = usernameInput?.value.trim();
      const p = passwordInput?.value.trim();

      const savedUser = JSON.parse(localStorage.getItem("registeredUser"));

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        // Authenticate with local state / mock fallback
        let matchedUser = Object.values(DEMO_ACCOUNTS).find(
  acc => acc.username === u && acc.password === p
);
let matchedSavedUser = savedUser && savedUser.username === u && savedUser.password === p;

if (!matchedUser && !matchedSavedUser) {
  alert("Incorrect Username or Password!");

  if (submitBtn) {
    submitBtn.innerHTML =
      '<i class="fa-solid fa-right-to-bracket"></i> Launch Dashboard';
    submitBtn.disabled = false;
  }

  return;
}
        // Choose logged-in user
// Choose logged-in user
const loggedInUser = matchedUser || savedUser;

// Save session
localStorage.setItem('aura_current_user', JSON.stringify(loggedInUser));

if (window.showToast) {
  window.showToast(
    'Login Successful!',
    `Redirecting to ${loggedInUser.role} Dashboard...`,
    'success'
  );
}

setTimeout(() => {
  window.location.href = `dashboard.html?role=${loggedInUser.role}`;
}, 800);

      }, 700);
    });
  }
});