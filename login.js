document.addEventListener('DOMContentLoaded', function () {
  const signInSection = document.querySelector('.auth-card.sign-in');
  const registerSection = document.querySelector('.auth-card.register');
  const showRegister = document.getElementById('show-register');
  const showSignIn = document.getElementById('show-sign-in');
  const signInForm = document.getElementById('signin-form');
  const registerForm = document.getElementById('register-form');
  const signInToggle = document.getElementById('sign-in-toggle');
  const registerToggle = document.getElementById('register-toggle');

  function toggleView() {
    signInSection.classList.toggle('hidden');
    registerSection.classList.toggle('hidden');
  }

  showRegister.addEventListener('click', function (event) {
    event.preventDefault();
    toggleView();
  });

  showSignIn.addEventListener('click', function (event) {
    event.preventDefault();
    toggleView();
  });

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showMessage(form, message, type) {
    const messageBox = form.querySelector('.message');
    messageBox.textContent = message;
    messageBox.className = 'message ' + type;
    messageBox.style.display = 'block';
  }

  function clearMessage(form) {
    const messageBox = form.querySelector('.message');
    messageBox.textContent = '';
    messageBox.style.display = 'none';
    messageBox.className = 'message';
  }

  signInToggle.addEventListener('change', function () {
    const passwordInput = document.getElementById('signin-password');
    passwordInput.type = this.checked ? 'text' : 'password';
  });

  registerToggle.addEventListener('change', function () {
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('register-confirm');
    const type = this.checked ? 'text' : 'password';
    passwordInput.type = type;
    confirmInput.type = type;
  });

  signInForm.addEventListener('submit', function (event) {
    event.preventDefault();
    clearMessage(signInForm);

    const email = signInForm.email.value.trim();
    const password = signInForm.password.value.trim();

    if (!email || !password) {
      showMessage(signInForm, 'Please fill in both email and password.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMessage(signInForm, 'Enter a valid email address.', 'error');
      return;
    }

    showMessage(signInForm, 'Sign in successful. Redirecting to your dashboard...', 'success');
    setTimeout(function () {
      window.location.href = 'user-dashboard.html';
    }, 800);
  });

  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    clearMessage(registerForm);

    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value.trim();
    const confirm = registerForm.confirm.value.trim();

    if (!name || !email || !password || !confirm) {
      showMessage(registerForm, 'Please complete all fields to create your account.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMessage(registerForm, 'Please provide a valid email address.', 'error');
      return;
    }

    if (password !== confirm) {
      showMessage(registerForm, 'Passwords do not match. Please try again.', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage(registerForm, 'Password should be at least 6 characters long.', 'error');
      return;
    }

    showMessage(registerForm, 'Account created successfully. Redirecting to your dashboard...', 'success');
    setTimeout(function () {
      window.location.href = 'user-dashboard.html';
    }, 800);
  });
});

