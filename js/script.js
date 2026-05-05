
 
      /* ============================
         MODAL OPEN / CLOSE
      ============================= */
      const overlay       = document.getElementById('modal-overlay');
      const loginModal    = document.getElementById('login-modal');
      const registerModal = document.getElementById('register-modal');

      function openOverlay() {
        overlay.classList.add('overlay-active');
        document.body.classList.add('modal-open');
      }

      function closeOverlay() {
        overlay.classList.remove('overlay-active');
        document.body.classList.remove('modal-open');
        // reset both modals to default visibility
        loginModal.classList.remove('modal-hidden');
        registerModal.classList.add('modal-hidden');
      }

      function showRegister() {
        loginModal.classList.add('modal-hidden');
        registerModal.classList.remove('modal-hidden');
      }

      function showLogin() {
        registerModal.classList.add('modal-hidden');
        loginModal.classList.remove('modal-hidden');
      }

      // Open on Login button click
      document.getElementById('open-login-btn').addEventListener('click', function(e) {
        e.preventDefault();
        openOverlay();
      });

      // Close buttons
      document.getElementById('close-login').addEventListener('click', closeOverlay);
      document.getElementById('close-register').addEventListener('click', closeOverlay);

      // Close on overlay background click
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeOverlay();
      });

      // Switch to Register
      document.getElementById('go-to-register').addEventListener('click', function(e) {
        e.preventDefault();
        showRegister();
      });

      // Switch back to Login
      document.getElementById('go-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
      });

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeOverlay();
      });

      // Open login modal immediately on page load
      window.addEventListener('DOMContentLoaded', function() {
        openOverlay();
      });

      /* ============================
         TOGGLE PASSWORD VISIBILITY
      ============================= */
      function togglePassword(inputId, btn) {
        const input = document.getElementById(inputId);
        const icon  = btn.querySelector('i');
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
          input.type = 'password';
          icon.classList.replace('fa-eye', 'fa-eye-slash');
        }

/* ============================
         FORM HANDLERS
      ============================= */
      function handleLogin(e) {
        e.preventDefault();
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        if (!email || !password) return;
        // Simulate login — redirect to home
        alert('Logged in successfully! Welcome back.');
        closeOverlay();
        window.location.href = 'index.html';
      }

      function handleRegister(e) {
        e.preventDefault();
        const name     = document.getElementById('reg-name').value.trim();
        const email    = document.getElementById('reg-email').value.trim();
        const pw       = document.getElementById('reg-password').value;
        const confirm  = document.getElementById('reg-confirm').value;

        if (!name || !email || !pw || !confirm) return;

        if (pw !== confirm) {
          alert('Passwords do not match. Please try again.');
          return;
        }
        // Simulate registration success — switch to login
        alert('Account created successfully! Please sign in.');
        showLogin();
      }
    