// Small helper shared by all frontend pages to manage the JWT in the browser.
// We use localStorage here (browser-only storage that survives page reloads)
// since there's no server-side session — the token itself IS the proof of login.

function getToken() {
  return localStorage.getItem('token');
}

function getUsername() {
  return localStorage.getItem('username');
}

function saveSession(token, username) {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

function requireLogin() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

function updateNavAuthStatus() {
  const authArea = document.getElementById('auth-status');
  if (!authArea) return;
  const username = getUsername();
  if (username) {
    authArea.innerHTML = `Logged in as <strong>${username}</strong> | <a href="#" onclick="logout()">Logout</a>`;
  } else {
    authArea.innerHTML = `<a href="login.html">Login</a>`;
  }
}