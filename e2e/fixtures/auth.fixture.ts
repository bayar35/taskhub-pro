import { test as base, Page } from '@playwright/test';
import {
  TestUser,
  uniqueUser,
  registerViaAPI,
  loginViaUI,
} from '../utils/auth';

type AuthFixtures = {
  authenticatedPage: Page;
  testUser: TestUser;
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    await use(uniqueUser('authed'));
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // 1. API-аар хурдан register (Vite UI ачаалалтыг алгасах)
    await registerViaAPI(testUser);

    // 2. UI-аар login
    await loginViaUI(page, testUser);

    await use(page);
  },
});

export { expect } from '@playwright/test';