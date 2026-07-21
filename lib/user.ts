export type UserAccount = {
  username: string;
  password: string;
  createdAt: number;
};

const USERS_KEY = "fut_users";
const CURRENT_USER_KEY = "fut_current_user";
const GUEST_PREFIX = "guest";

export function getStoredUsers(): Record<string, UserAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveUsers(users: Record<string, UserAccount>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function setCurrentUser(username: string | null) {
  if (typeof window === "undefined") return;
  if (!username) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, username);
}

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function createUser(username: string, password: string): { success: boolean; message: string } {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return { success: false, message: "Username cannot be empty." };
  if (password.trim().length < 4) return { success: false, message: "Password must be at least 4 characters." };

  const users = getStoredUsers();
  if (users[normalized]) {
    return { success: false, message: "Username already exists." };
  }

  users[normalized] = { username: normalized, password, createdAt: Date.now() };
  saveUsers(users);
  setCurrentUser(normalized);
  return { success: true, message: "Account created." };
}

export function validateUser(username: string, password: string): { success: boolean; message: string } {
  const normalized = username.trim().toLowerCase();
  const users = getStoredUsers();
  const existing = users[normalized];
  if (!existing) return { success: false, message: "No account found with that username." };
  if (existing.password !== password) return { success: false, message: "Password does not match." };
  setCurrentUser(normalized);
  return { success: true, message: "Signed in." };
}

export function logoutUser() {
  setCurrentUser(null);
}

export function getUserKey(key: string): string {
  const current = getCurrentUser();
  return current ? `${current}:${key}` : key;
}

export function getCurrentUserLabel() {
  const user = getCurrentUser();
  return user ? `@${user}` : "Guest";
}
