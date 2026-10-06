import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Постоянная папка рядом с проектом — не временная, живёт между запусками.
const userDataDir = path.resolve(__dirname, "../.chrome-profile");

export const test = base.extend<{ context: BrowserContext }>({
  context: async ({ launchOptions }, use) => {
    // launchOptions — встроенная фикстура Playwright с уже разрешёнными
    // настройками (включая --headed/headless из командной строки), которые
    // иначе игнорировались бы, раз мы вызываем launchPersistentContext сами.
    const context = await chromium.launchPersistentContext(userDataDir, {
      ...launchOptions,
      args: [
        ...(launchOptions.args || []),
        "--disable-features=DownloadRestrictions,ExternalProtocolDialog,PrivateNetworkAccessPermissionPrompt",
        "--disable-features=PrivateNetworkAccessSendPreflights",
      ],
    });

    // Подхватываем сессию, сохранённую в auth.setup.ts (логика логина там
    // не меняется вообще) — руками через addCookies, так как
    // launchPersistentContext в типах @playwright/test не принимает
    // storageState напрямую.
    if (fs.existsSync(".auth/user.json")) {
      const saved = JSON.parse(fs.readFileSync(".auth/user.json", "utf-8"));
      if (saved.cookies?.length) {
        await context.addCookies(saved.cookies);
      }
    }

    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    await use(page);
  },
});

export { expect } from "@playwright/test";
