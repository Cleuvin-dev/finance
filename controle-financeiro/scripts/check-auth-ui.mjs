import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const base = process.env.AUTH_TEST_URL ?? 'http://localhost:3017';
await fs.mkdir('outputs/auth-check', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // All browser-side mutations to Supabase are mocked; no real accounts or emails.
    await page.route('**/auth/v1/**', async route => {
      const request = route.request();
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: {
        'Access-Control-Allow-Origin': base,
        'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*',
      } });
      const endpoint = new URL(request.url()).pathname;
      if (request.method() === 'POST' && endpoint.endsWith('/token')) {
        return route.fulfill({ status: 400, json: { error_code: 'invalid_credentials', msg: 'Invalid login credentials' },
          headers: { 'Access-Control-Allow-Origin': base } });
      }
      if (request.method() === 'POST' && endpoint.endsWith('/recover')) {
        const url = new URL(request.url());
        assert.equal(url.searchParams.get('redirect_to'), `${base}/auth/callback?next=/nova-senha`);
        return route.fulfill({ status: 200, json: {}, headers: { 'Access-Control-Allow-Origin': base } });
      }
      if (request.method() !== 'GET') throw new Error(`Unexpected external mutation: ${endpoint}`);
      return route.continue();
    });

    await page.goto(base);
    await page.waitForURL('**/login');
    await page.getByRole('heading', { name: 'Seu controle começa aqui.' }).waitFor();
    const response = await context.request.get(`${base}/api/state`);
    assert.equal(response.status(), 401);
    assert.match(response.headers()['cache-control'], /private, no-store/);
    await page.getByLabel('E-mail', { exact: true }).fill('test@example.test');
    await page.getByLabel('Senha', { exact: true }).fill('invalid-password');
    await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
    await page.getByRole('alert').filter({ hasText: 'E-mail ou senha incorretos.' }).waitFor();
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert(dimensions.scroll <= dimensions.width, `Horizontal overflow at ${viewport.width}px`);
    await page.screenshot({ path: `outputs/auth-check/login-${viewport.width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Ativar modo escuro' }).click();
    await page.screenshot({ path: `outputs/auth-check/login-dark-${viewport.width}.png`, fullPage: true });

    await page.getByRole('link', { name: 'Criar conta', exact: true }).click();
    await page.getByLabel('Seu nome', { exact: true }).fill('Test user');
    await page.getByLabel('E-mail', { exact: true }).fill('test@example.test');
    await page.getByLabel('Senha', { exact: true }).fill('new-password');
    await page.getByLabel('Confirme a senha', { exact: true }).fill('different-password');
    await page.getByRole('button', { name: 'Criar minha conta' }).click();
    await page.getByRole('alert').filter({ hasText: 'As senhas precisam ser iguais.' }).waitFor();
    await page.screenshot({ path: `outputs/auth-check/signup-${viewport.width}.png`, fullPage: true });

    await page.goto(`${base}/recuperar-senha`);
    await page.getByLabel('E-mail', { exact: true }).fill('test@example.test');
    await page.getByRole('button', { name: 'Enviar link de recuperação' }).click();
    await page.getByRole('status').filter({ hasText: 'Se houver uma conta' }).waitFor();
    await page.goto(`${base}/nova-senha`);
    await page.waitForURL('**/recuperar-senha');
    await page.goto(`${base}/auth/callback?next=https://evil.example`);
    await page.waitForURL('**/login?error=link');
    await page.getByRole('alert').filter({ hasText: 'Esse link expirou' }).waitFor();
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('OK: desktop/mobile login, dark theme, invalid login, password confirmation, recovery redirect and anonymous API denial. No real accounts created or emails sent.');
} finally { await browser.close(); }
