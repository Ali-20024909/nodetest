// DOM Elements
const elements = {
  emailInput: document.getElementById('emailInput'),
  passwordInput: document.getElementById('passwordInput'),
  continueButton: document.getElementById('continueButton'),
  loadingOverlay: document.getElementById('loadingOverlay')
};

// API Configuration
const API_URL = 'http://localhost:3000'; // Update this with your actual API URL

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  setupAuthListeners();
  setupPasswordToggle();
  
  // Check for existing token
  const token = localStorage.getItem('authToken');
  if (token) {
      window.location.href = 'index.html';
  }
});

function setupPasswordToggle() {
  const passwordInput = document.getElementById('passwordInput');
  const toggleButton = document.querySelector('.password-toggle');
  const toggleIcon = toggleButton.querySelector('i');

  toggleButton.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;

      if (type === 'password') {
          toggleIcon.className = 'fas fa-eye';
          toggleButton.classList.remove('showing');
      } else {
          toggleIcon.className = 'fas fa-eye-slash';
          toggleButton.classList.add('showing');
      }

      passwordInput.focus();
  });
}

function setupAuthListeners() {
  elements.continueButton.addEventListener('click', handleLogin);
  elements.passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
  });
}

async function handleLogin() {
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value;

  if (!email || !password) {
      alert('Please enter both email and password');
      return;
  }

  showLoading(true);

  try {
      // Try to login
      const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
          throw { code: data.error };
      }

      // Store token and redirect
      localStorage.setItem('authToken', data.token);
      window.location.href = 'index.html';

  } catch (error) {
      console.log('Auth error:', error.code);

      switch (error.code) {
          case 'user_not_found':
              const createAccount = confirm('No account found with these credentials. Would you like to create a new account? API');
              if (createAccount) {
                  try {
                      // Create new account
                      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                              name: email.split('@')[0],
                              email,
                              password
                          })
                      });

                      const registerData = await registerResponse.json();

                      if (!registerResponse.ok) {
                          throw { code: registerData.error };
                      }

                      // Store token and redirect
                      localStorage.setItem('authToken', registerData.token);
                      window.location.href = 'index.html';

                  } catch (createError) {
                      showLoading(false);
                      if (createError.code === 'email_already_exists') {
                          alert('This email is already registered. Please try logging in with the correct password.API');
                      } else {
                          alert('Failed to create account. Please try again.API');
                      }
                  }
              } else {
                  showLoading(false);
              }
              break;

          case 'invalid_credentials':
              alert('Invalid email or password. Please try again.API');
              elements.passwordInput.value = '';
              elements.passwordInput.focus();
              break;

          case 'account_disabled':
              showDisabledDialog();
              break;

          default:
              alert('Login error. Please try again.API');
      }
      
      showLoading(false);
  }
}

function showLoading(show) {
  elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showDisabledDialog() {
  document.getElementById('disabledDialog').style.display = 'flex';
}

function handleDisabledAccount() {
  localStorage.removeItem('authToken');
  document.getElementById('disabledDialog').style.display = 'none';
  elements.emailInput.value = '';
  elements.passwordInput.value = '';
  showLoading(false);
}