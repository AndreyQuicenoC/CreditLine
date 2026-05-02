#!/usr/bin/env node
/**
 * Frontend Diagnostics Script
 * Run this in browser console to test authentication and API
 */

console.log("\n" + "=".repeat(60));
console.log("CREDITLINE FRONTEND DIAGNOSTICS");
console.log("=".repeat(60));

// 1. Check localStorage
console.log("\n[1] localStorage Status:");
const token = localStorage.getItem("creditline_token");
const user = localStorage.getItem("creditline_user");
console.log(
  "  - creditline_token:",
  token ? `${token.substring(0, 50)}...` : "NOT FOUND",
);
console.log("  - creditline_user:", user ? JSON.parse(user) : "NOT FOUND");

if (user) {
  const userData = JSON.parse(user);
  console.log("    - Email:", userData.email);
  console.log("    - Role:", userData.rol);
  console.log("    - Active:", userData.is_active);
}

// 2. Test API connectivity
console.log("\n[2] API Connectivity Test:");
const API_URL =
  (typeof window !== "undefined" && window.__CREDITLINE_API_URL__) ||
  "http://localhost:8000";
console.log("  - API URL:", API_URL);

// 3. Simulate listUsers request
console.log("\n[3] Testing /api/users/list/ endpoint:");
if (token) {
  fetch(`${API_URL}/api/users/list/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      console.log("  - Status:", res.status);
      if (res.status === 200) {
        return res.json().then((data) => {
          console.log("  - Response: Success!");
          console.log("  - Users count:", data.length);
          console.log("  - Users:", data);
          return data;
        });
      } else if (res.status === 401) {
        console.error("  - Response: 401 Unauthorized");
        console.error("  - Token may be invalid or expired");
      } else {
        return res.json().then((data) => {
          console.error("  - Response error:", data);
        });
      }
    })
    .catch((err) => console.error("  - Error:", err));
} else {
  console.warn("  - No token found, skipping request");
}

// Export helper for manual testing
window.creditlineDiagnostics = {
  clearAuth: () => {
    localStorage.removeItem("creditline_token");
    localStorage.removeItem("creditline_user");
    console.log("Auth cleared");
  },
  getToken: () => localStorage.getItem("creditline_token"),
  getUser: () => JSON.parse(localStorage.getItem("creditline_user") || "null"),
  testLogin: (email, password) => {
    return fetch(`${API_URL}/api/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());
  },
};

console.log("Available commands:");
console.log("  - creditlineDiagnostics.clearAuth()");
console.log("  - creditlineDiagnostics.getToken()");
console.log("  - creditlineDiagnostics.getUser()");
console.log("  - creditlineDiagnostics.testLogin('email', 'password')");
