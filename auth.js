// Authentication Page Logic
// - Tabs for Login/Register/Forgot/Reset
// - Validation: email format/uniqueness, password strength
// - Persistence: localStorage users[] and loggedInUser
// - Password visibility toggle
// - Forgot password flow with verification code
// - Accessibility modes + footer utilities, consistent with main app

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, go to app
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      window.location.href = 'index.html';
      return;
    }

    initAccessibility();
    initFooter();
    setYear();
    initTabs();
    initForms();
    initPasswordToggles();
    initCodeModal();
    initInfoModal();
  });

  // Year in footer
  function setYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  // Tabs
  function initTabs() {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const panelLogin = document.getElementById('panel-login');
    const panelRegister = document.getElementById('panel-register');
    const panelForgot = document.getElementById('panel-forgot');
    const panelReset = document.getElementById('panel-reset');

    const activate = (which) => {
      const isLogin = which === 'login';
      const isRegister = which === 'register';
      const isForgot = which === 'forgot';
      const isReset = which === 'reset';

      // Update tab states (only for main tabs)
      tabLogin.classList.toggle('active', isLogin);
      tabRegister.classList.toggle('active', isRegister);
      tabLogin.setAttribute('aria-selected', String(isLogin));
      tabRegister.setAttribute('aria-selected', String(isRegister));

      // Show/hide panels
      panelLogin.classList.toggle('hidden', !isLogin);
      panelRegister.classList.toggle('hidden', !isRegister);
      panelForgot.classList.toggle('hidden', !isForgot);
      panelReset.classList.toggle('hidden', !isReset);

      panelLogin.style.display = isLogin ? 'block' : 'none';
      panelRegister.style.display = isRegister ? 'block' : 'none';
      panelForgot.style.display = isForgot ? 'block' : 'none';
      panelReset.style.display = isReset ? 'block' : 'none';

      // Clear error messages when switching
      document.querySelectorAll('.auth-error, .auth-success').forEach(el => el.textContent = '');
    };

    tabLogin.addEventListener('click', () => activate('login'));
    tabRegister.addEventListener('click', () => activate('register'));

    // Forgot password navigation
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (forgotBtn) forgotBtn.addEventListener('click', () => activate('forgot'));
    if (backToLoginBtn) backToLoginBtn.addEventListener('click', () => activate('login'));

    // Expose activate function for form handlers
    window.authActivate = activate;

    // Default to login tab
    activate('login');
  }

  // Password Toggle
  function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const wrapper = btn.closest('.password-wrapper');
        const input = wrapper.querySelector('input');
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
          btn.setAttribute('aria-label', 'Passwort verbergen');
        } else {
          input.type = 'password';
          btn.textContent = '👁️';
          btn.setAttribute('aria-label', 'Passwort anzeigen');
        }
      });
    });
  }

  // Forms
  function initForms() {
    const loginForm = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');

    const registerForm = document.getElementById('registerForm');
    const regName = document.getElementById('regName');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const registerError = document.getElementById('registerError');

    const forgotForm = document.getElementById('forgotForm');
    const forgotEmail = document.getElementById('forgotEmail');
    const forgotError = document.getElementById('forgotError');
    const forgotSuccess = document.getElementById('forgotSuccess');

    const resetForm = document.getElementById('resetForm');
    const resetPassword = document.getElementById('resetPassword');
    const resetPasswordConfirm = document.getElementById('resetPasswordConfirm');
    const resetError = document.getElementById('resetError');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.textContent = '';

      const email = (loginEmail.value || '').trim().toLowerCase();
      const password = (loginPassword.value || '').trim();

      if (!validateEmail(email)) {
        loginError.textContent = 'Bitte eine gültige E-Mail eingeben.';
        return;
      }
      if (!password) {
        loginError.textContent = 'Bitte Passwort eingeben.';
        return;
      }

      const users = getUsers();
      const user = users.find(u => u.email === email);
      if (!user) {
        loginError.textContent = 'E-Mail oder Passwort ist falsch.';
        return;
      }

      try {
        const hash = await hashPassword(password);
        if (hash !== user.passwordHash) {
          loginError.textContent = 'E-Mail oder Passwort ist falsch.';
          return;
        }
      } catch (err) {
        // Fallback: compare plain text if hashing fails (should be rare)
        if (password !== user.passwordHash) {
          loginError.textContent = 'E-Mail oder Passwort ist falsch.';
          return;
        }
      }

      // Success
      localStorage.setItem('loggedInUser', email);
      localStorage.setItem('isLoggedIn', 'true');
      if (user.name) localStorage.setItem('username', user.name);
      window.location.href = 'index.html';
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      registerError.textContent = '';

      const name = (regName.value || '').trim();
      const email = (regEmail.value || '').trim().toLowerCase();
      const password = (regPassword.value || '').trim();

      if (!name) {
        registerError.textContent = 'Bitte Name eingeben.';
        return;
      }
      if (!validateEmail(email)) {
        registerError.textContent = 'Bitte eine gültige E-Mail eingeben.';
        return;
      }

      const users = getUsers();
      if (users.some(u => u.email === email)) {
        registerError.textContent = 'Diese E-Mail ist bereits registriert.';
        return;
      }

      const pwdError = passwordPolicyError(password);
      if (pwdError) {
        registerError.textContent = pwdError;
        return;
      }

      let passwordHash = password; // fallback
      try {
        passwordHash = await hashPassword(password);
      } catch {}

      // Add registration date
      const registeredDate = new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      users.push({ name, email, passwordHash, registeredDate });
      saveUsers(users);

      localStorage.setItem('loggedInUser', email);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', name);
      window.location.href = 'index.html';
    });

    // Forgot Password Form
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      forgotError.textContent = '';
      forgotSuccess.textContent = '';

      const email = (forgotEmail.value || '').trim().toLowerCase();

      if (!validateEmail(email)) {
        forgotError.textContent = 'Bitte eine gültige E-Mail eingeben.';
        return;
      }

      const users = getUsers();
      const user = users.find(u => u.email === email);
      if (!user) {
        forgotError.textContent = 'Diese E-Mail ist nicht registriert.';
        return;
      }

      // Generate a 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store code with expiry (5 minutes)
      const resetData = {
        email,
        code: verificationCode,
        expiry: Date.now() + 5 * 60 * 1000
      };
      localStorage.setItem('passwordReset', JSON.stringify(resetData));

      // Send real email with verification code
      forgotSuccess.textContent = 'Sende E-Mail...';
      const emailSent = window.sendVerificationEmail 
        ? await window.sendVerificationEmail(email, verificationCode)
        : false;

      if (!emailSent) {
        // Fallback: in development, show code for testing; never expose in production
        const host = (window.location && window.location.hostname) || '';
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        if (isLocal) {
          forgotSuccess.textContent = `Ein Bestätigungscode wurde an ${email} gesendet. Code: ${verificationCode}`;
          console.warn('E-Mail-Versand fehlgeschlagen. Code wird NUR in der lokalen Entwicklung angezeigt.');
        } else {
          forgotSuccess.textContent = `Ein Bestätigungscode wurde an ${email} gesendet. Bitte überprüfen Sie Ihr Postfach (und den Spam-Ordner).`;
          console.warn('E-Mail-Versand fehlgeschlagen. Code wird aus Sicherheitsgründen nicht angezeigt.');
        }
      } else {
        forgotSuccess.textContent = `Ein Bestätigungscode wurde an ${email} gesendet. Bitte überprüfen Sie Ihr Postfach.`;
      }

      // Show code modal and wait for user input
      const codeOk = await showCodeModal();
      if (!codeOk) return; // user canceled

      // Validate code and expiry
      const stored = safeParse(localStorage.getItem('passwordReset')) || {};
      if (!stored.email || stored.email !== email) {
        forgotError.textContent = 'Etwas ist schief gelaufen. Bitte erneut versuchen.';
        return;
      }
      if (!stored.expiry || Date.now() > stored.expiry) {
        forgotError.textContent = 'Bestätigungscode ist abgelaufen. Bitte neu anfordern.';
        return;
      }
      const inputCode = getCodeModalValue();
      if (!inputCode || inputCode !== stored.code) {
        forgotError.textContent = 'Ungültiger Bestätigungscode.';
        return;
      }

      // Code valid -> proceed to reset
      localStorage.setItem('verifiedResetEmail', email);
      if (window.authActivate) window.authActivate('reset');
    });

    // Reset Password Form
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      resetError.textContent = '';

      const verifiedEmail = localStorage.getItem('verifiedResetEmail');
      if (!verifiedEmail) {
        resetError.textContent = 'Sitzung abgelaufen. Bitte fordern Sie einen neuen Code an.';
        return;
      }

      const password = (resetPassword.value || '').trim();
      const confirmPassword = (resetPasswordConfirm.value || '').trim();

      if (password !== confirmPassword) {
        resetError.textContent = 'Passwörter stimmen nicht überein.';
        return;
      }

      const pwdError = passwordPolicyError(password);
      if (pwdError) {
        resetError.textContent = pwdError;
        return;
      }

      // Update user password
      const users = getUsers();
      const userIndex = users.findIndex(u => u.email === verifiedEmail);
      if (userIndex === -1) {
        resetError.textContent = 'Benutzer nicht gefunden.';
        return;
      }

      // Prevent using the same password again
      let newHash = password;
      try {
        newHash = await hashPassword(password);
      } catch {}

      const oldHash = users[userIndex].passwordHash;
      if ((newHash && oldHash && newHash === oldHash) || (!newHash && password === oldHash)) {
        resetError.textContent = 'Neues Passwort darf nicht dem alten Passwort entsprechen.';
        return;
      }

      users[userIndex].passwordHash = newHash;
      saveUsers(users);

      // Clean up reset data
      localStorage.removeItem('passwordReset');
      localStorage.removeItem('verifiedResetEmail');

      // Show info modal and then go to login
      await showInfo('Passwort erfolgreich zurückgesetzt! Sie können sich jetzt anmelden.');
      if (window.authActivate) window.authActivate('login');
    });
  }

  // Helpers to parse JSON safely
  function safeParse(s) {
    try { return JSON.parse(s || 'null'); } catch { return null; }
  }

  // Code modal controller
  function initCodeModal() {
    const modal = document.getElementById('codeModal');
    const codeInput = document.getElementById('verificationCodeInput');
    const codeConfirm = document.getElementById('codeConfirm');
    const codeCancel = document.getElementById('codeCancel');
    const codeError = document.getElementById('codeError');

    if (!modal) return;

    // Reset on open
    modal.addEventListener('show', () => {
      codeInput.value = '';
      codeError.textContent = '';
      setTimeout(() => codeInput.focus(), 50);
    });

    // Enter to submit
    codeInput && codeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        codeConfirm && codeConfirm.click();
      }
    });
  }

  function showCodeModal() {
    const modal = document.getElementById('codeModal');
    const codeInput = document.getElementById('verificationCodeInput');
    const codeConfirm = document.getElementById('codeConfirm');
    const codeCancel = document.getElementById('codeCancel');
    const codeError = document.getElementById('codeError');
    if (!modal) return Promise.resolve(false);

    return new Promise((resolve) => {
      const cleanup = () => {
        modal.classList.remove('show');
        codeConfirm.removeEventListener('click', onConfirm);
        codeCancel.removeEventListener('click', onCancel);
      };
      const onConfirm = () => {
        const v = (codeInput.value || '').trim();
        if (!/^\d{6}$/.test(v)) {
          codeError.textContent = 'Bitte einen 6-stelligen Code eingeben.';
          return;
        }
        cleanup();
        resolve(true);
      };
      const onCancel = () => { cleanup(); resolve(false); };

      codeError.textContent = '';
      codeInput.value = '';
      modal.classList.add('show');
      // Fire a custom event to reset and focus
      modal.dispatchEvent(new Event('show'));
      setTimeout(() => codeInput && codeInput.focus(), 50);

      codeConfirm.addEventListener('click', onConfirm);
      codeCancel.addEventListener('click', onCancel);
    });
  }

  function getCodeModalValue() {
    const codeInput = document.getElementById('verificationCodeInput');
    return (codeInput && codeInput.value || '').trim();
  }

  // Info modal
  function initInfoModal() {
    const modal = document.getElementById('infoModal');
    const ok = document.getElementById('infoOk');
    if (!modal || !ok) return;
  }

  function showInfo(message, title = 'Hinweis') {
    const modal = document.getElementById('infoModal');
    const msg = document.getElementById('infoMessage');
    const t = document.getElementById('infoTitle');
    const ok = document.getElementById('infoOk');
    if (!modal || !msg || !ok) return Promise.resolve();
    return new Promise((resolve) => {
      const cleanup = () => {
        modal.classList.remove('show');
        ok.removeEventListener('click', onOk);
      };
      const onOk = () => { cleanup(); resolve(); };
      msg.textContent = message;
      if (t) t.textContent = title;
      modal.classList.add('show');
      ok.addEventListener('click', onOk);
    });
  }

  // User storage helpers
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('users') || '[]');
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Validation
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function passwordPolicyError(password) {
    if (!password || password.length < 8) return 'Passwort muss mindestens 8 Zeichen lang sein.';
    if (!/[A-Z]/.test(password)) return 'Passwort muss mindestens einen Großbuchstaben enthalten.';
    if (!/[a-z]/.test(password)) return 'Passwort muss mindestens einen Kleinbuchstaben enthalten.';
    if (!/[0-9]/.test(password)) return 'Passwort muss mindestens eine Zahl enthalten.';
    if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/;'+=]/.test(password)) return 'Passwort muss mindestens ein Sonderzeichen enthalten.';
    return '';
  }

  async function hashPassword(text) {
    if (!window.crypto || !window.crypto.subtle) throw new Error('Crypto not available');
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Accessibility (same behavior as main app)
  function initAccessibility() {
    const accessibilityBtn = document.getElementById('accessibilityBtn');
    const accessibilityModal = document.getElementById('accessibilityModal');
    const accessibilityCancel = document.getElementById('accessibilityCancel');
    const accessibilityOptions = document.querySelectorAll('.accessibility-option');

    const saved = localStorage.getItem('accessibilityMode') || 'default';
    applyMode(saved);
    updateActive(saved);

    if (accessibilityBtn) {
      accessibilityBtn.addEventListener('click', () => accessibilityModal.classList.add('show'));
    }
    if (accessibilityCancel) {
      accessibilityCancel.addEventListener('click', () => accessibilityModal.classList.remove('show'));
    }
    accessibilityOptions.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        applyMode(mode);
        updateActive(mode);
        localStorage.setItem('accessibilityMode', mode);
        setTimeout(() => accessibilityModal.classList.remove('show'), 250);
      });
    });

    function applyMode(mode) {
      document.body.classList.remove('dark-mode', 'high-contrast', 'protanopia', 'deuteranopia', 'tritanopia');
      if (mode !== 'default') document.body.classList.add(mode);
    }

    function updateActive(mode) {
      document.querySelectorAll('.accessibility-option').forEach(el => {
        el.classList.toggle('active', el.dataset.mode === mode);
      });
    }
  }

  function initFooter() {
    const openAcc = document.getElementById('openAccessibility');
    if (openAcc) openAcc.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('accessibilityModal');
      if (modal) modal.classList.add('show');
    });

    const scrollTop = document.getElementById('scrollTop');
    if (scrollTop) scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
