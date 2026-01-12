// src/utils/auth.js

export function setSession(token, user) {
  if (!token || !user) return;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser() {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    clearSession(); // corrupted data safety
    return null;
  }
}

export function getRole() {
  const user = getUser();
  return user?.role ?? null;
}

export function isAuthenticated() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() >= payload.exp * 1000) {
      localStorage.clear();
      return false;
    }
    return true;
  } catch {
    localStorage.clear();
    return false;
  }
}
