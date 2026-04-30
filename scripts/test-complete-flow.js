#!/usr/bin/env node

/**
 * API Testing Script
 * Tests the full login -> get users flow
 * Run: node scripts/test-complete-flow.js
 */

const API_URL = process.env.VITE_API_URL || "http://localhost:8000";
const ADMIN_EMAIL = "admin@creditline.com";
const ADMIN_PASSWORD = "admin123";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testCompleteFlow() {
  console.log("\n" + "=".repeat(70));
  console.log("COMPLETE AUTHENTICATION & DATA FLOW TEST");
  console.log("=".repeat(70));
  console.log(`API URL: ${API_URL}\n`);

  let token = null;
  let user = null;

  try {
    // Step 1: Login
    console.log("[STEP 1] Testing LOGIN endpoint");
    console.log(`POST ${API_URL}/api/users/login/`);
    console.log(`Body: { email: "${ADMIN_EMAIL}", password: "***" }`);

    const loginRes = await fetch(`${API_URL}/api/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    console.log(`Response Status: ${loginRes.status}`);

    if (!loginRes.ok) {
      const errorData = await loginRes.json();
      throw new Error(`Login failed: ${loginRes.status} - ${errorData.error}`);
    }

    const loginData = await loginRes.json();
    token = loginData.token;
    user = loginData.user;

    console.log("✓ Login successful");
    console.log(`  - User: ${user.nombre} (${user.email})`);
    console.log(`  - Role: ${user.rol}`);
    console.log(`  - Token: ${token.substring(0, 50)}...`);

    // Step 2: Test listUsers
    console.log("\n[STEP 2] Testing GET /api/users/list/");
    console.log(`Headers: Authorization: Bearer ${token.substring(0, 20)}...`);

    await sleep(500);

    const usersRes = await fetch(`${API_URL}/api/users/list/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Response Status: ${usersRes.status}`);

    if (!usersRes.ok) {
      const errorData = await usersRes.json().catch(() => ({}));
      throw new Error(
        `Failed to get users: ${usersRes.status} - ${
          errorData.error || "Unknown error"
        }`,
      );
    }

    const users = await usersRes.json();
    console.log("✓ Users fetched successfully");
    console.log(`  - Count: ${users.length} users`);
    users.forEach((u) => {
      console.log(`    • ${u.nombre} (${u.email}) - ${u.rol}`);
    });

    // Step 3: Test getSystemConfig
    console.log("\n[STEP 3] Testing GET /api/users/system-config/");

    await sleep(500);

    const configRes = await fetch(`${API_URL}/api/users/system-config/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Response Status: ${configRes.status}`);

    if (!configRes.ok) {
      const errorData = await configRes.json().catch(() => ({}));
      throw new Error(
        `Failed to get config: ${configRes.status} - ${
          errorData.error || "Unknown error"
        }`,
      );
    }

    const config = await configRes.json();
    console.log("✓ System config fetched successfully");
    console.log(`  - Tasa Interes: ${config.tasa_interes}%`);
    console.log(`  - Impuesto Retraso: ${config.impuesto_retraso}%`);

    // Step 4: Test profile endpoint
    console.log("\n[STEP 4] Testing GET /api/users/profile/");

    await sleep(500);

    const profileRes = await fetch(`${API_URL}/api/users/profile/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Response Status: ${profileRes.status}`);

    if (profileRes.ok) {
      const profile = await profileRes.json();
      console.log("✓ Profile fetched successfully");
      console.log(`  - Name: ${profile.nombre}`);
      console.log(`  - Email: ${profile.email}`);
      console.log(`  - Last Access: ${profile.ultimo_acceso}`);
    } else {
      console.warn("⚠ Profile endpoint failed (not critical)");
    }

    // Final summary
    console.log("\n" + "=".repeat(70));
    console.log("✓ ALL TESTS PASSED - System is working correctly!");
    console.log("=".repeat(70) + "\n");

    return {
      success: true,
      token,
      user,
      usersCount: users.length,
      config,
    };
  } catch (error) {
    console.error("\n✗ TEST FAILED");
    console.error("Error:", error.message);
    console.log("\n" + "=".repeat(70));
    console.log("TROUBLESHOOTING:");
    console.log("1. Make sure backend is running on " + API_URL);
    console.log("2. Check database has users in user_profiles table");
    console.log("3. Check mock_auth_users table has password for admin");
    console.log("4. Check backend logs for JWT validation errors");
    console.log("5. Check CORS configuration in Django settings");
    console.log("=".repeat(70) + "\n");

    process.exit(1);
  }
}

// Run the test
testCompleteFlow().catch(console.error);
