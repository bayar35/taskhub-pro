import { Page } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:5000';

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

let counter = 0;
export function uniqueUser(prefix = 'e2e'): TestUser {
  counter += 1;
  const id = `${Date.now()}_${counter}`;
  return {
    username: `${prefix}_${id}`.slice(0, 30),  // Backend-ийн max length-д тохируулах
    email: `${prefix}_${id}@test.com`,
    password: 'TestPass123!',
  };
}

/**
 * API-аар register хийж, дараа нь UI-д нэвтрэх.
 * Энэ нь UI register-ийн timeout-ийг алгасна.
 */
export async function registerViaAPI(user: TestUser): Promise<string> {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API register failed: ${res.status} ${body}`);
  }

  const data: any = await res.json();
  const payload = data.data ?? data;
  return payload.accessToken ?? payload.token;
}

/**
 * Login page-руу орж, credentials оруулж, dashboard руу шилжих.
 */
export async function loginViaUI(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60_000 });

  await page
    .getByLabel(/username|нэр|хэрэглэгчийн нэр/i)
    .fill(user.username, { timeout: 20_000 });

  await page.locator('input[type="password"]').first().fill(user.password);

  await page
    .getByRole('button', { name: /нэвтрэх|login|sign in/i })
    .first()
    .click();

  await page.waitForURL(/\/(dashboard|todos|$)/, { timeout: 30_000 });
}

/**
 * UI-аар register хийх (сүүлийн арга — API ажиллахгүй бол).
 */
export async function registerViaUI(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register', { waitUntil: 'domcontentloaded', timeout: 60_000 });

  // Username
  const usernameInput = page
    .getByLabel(/username|нэр|хэрэглэгчийн нэр/i)
    .or(page.getByPlaceholder(/username/i));
  await usernameInput.first().fill(user.username, { timeout: 20_000 });

  // Email
  const emailInput = page
    .getByLabel(/email|и-мэйл/i)
    .or(page.getByPlaceholder(/email/i));
  await emailInput.first().fill(user.email, { timeout: 20_000 });

  // Password (эхний password input)
  await page.locator('input[type="password"]').first().fill(user.password);

  // Register button
  await page
    .getByRole('button', { name: /бүртгүүлэх|register|sign up/i })
    .first()
    .click();

  await page.waitForURL(/\/(dashboard|todos|$)/, { timeout: 30_000 });
}