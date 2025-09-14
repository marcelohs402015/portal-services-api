import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Autenticação e Login', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('deve carregar a página de login', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/Portal Services/);
    await helpers.expectElementVisible('[data-testid="login-form"]');
    await helpers.expectElementVisible('[data-testid="email-input"]');
    await helpers.expectElementVisible('[data-testid="password-input"]');
    await helpers.expectElementVisible('[data-testid="login-button"]');
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await helpers.login('admin@portalservices.com', 'password123');
    
    // Verifica se foi redirecionado para o dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await helpers.expectElementVisible('[data-testid="dashboard"]');
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    
    await helpers.fillForm({
      '[data-testid="email-input"]': 'invalid@email.com',
      '[data-testid="password-input"]': 'wrongpassword'
    });
    
    await helpers.submitForm('[data-testid="login-button"]');
    
    // Aguarda mensagem de erro
    await helpers.waitForNotification('error');
    await helpers.expectNotificationContains('Credenciais inválidas', 'error');
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/login');
    
    // Tenta submeter sem preencher campos
    await helpers.submitForm('[data-testid="login-button"]');
    
    // Verifica se aparecem mensagens de validação
    await helpers.expectElementVisible('[data-testid="email-error"]');
    await helpers.expectElementVisible('[data-testid="password-error"]');
  });

  test('deve validar formato de email', async ({ page }) => {
    await page.goto('/login');
    
    await helpers.fillForm({
      '[data-testid="email-input"]': 'invalid-email',
      '[data-testid="password-input"]': 'password123'
    });
    
    await helpers.submitForm('[data-testid="login-button"]');
    
    await helpers.expectElementVisible('[data-testid="email-error"]');
    await helpers.expectElementContainsText('[data-testid="email-error"]', 'Email inválido');
  });

  test('deve fazer logout corretamente', async ({ page }) => {
    // Faz login primeiro
    await helpers.login();
    
    // Clica no botão de logout
    await helpers.clickActionButton('logout');
    
    // Verifica se foi redirecionado para login
    await expect(page).toHaveURL(/.*login/);
    await helpers.expectElementVisible('[data-testid="login-form"]');
  });

  test('deve manter sessão após refresh', async ({ page }) => {
    await helpers.login();
    
    // Faz refresh da página
    await page.reload();
    
    // Verifica se ainda está logado
    await expect(page).toHaveURL(/.*dashboard/);
    await helpers.expectElementVisible('[data-testid="dashboard"]');
  });

  test('deve testar responsividade da página de login', async ({ page }) => {
    await page.goto('/login');
    await helpers.testResponsiveness();
  });

  test('deve testar navegação por teclado no login', async ({ page }) => {
    await page.goto('/login');
    
    // Testa navegação por Tab
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
  });

  test('deve testar acessibilidade do formulário de login', async ({ page }) => {
    await page.goto('/login');
    await helpers.testAccessibility();
  });
});
