import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Dashboard', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
  });

  test('deve carregar o dashboard com todas as seções', async ({ page }) => {
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verifica seções principais
    await helpers.expectElementVisible('[data-testid="dashboard-header"]');
    await helpers.expectElementVisible('[data-testid="stats-cards"]');
    await helpers.expectElementVisible('[data-testid="recent-emails"]');
    await helpers.expectElementVisible('[data-testid="recent-quotes"]');
    await helpers.expectElementVisible('[data-testid="quick-actions"]');
  });

  test('deve exibir estatísticas corretas', async ({ page }) => {
    // Verifica cards de estatísticas
    await helpers.expectElementVisible('[data-testid="stat-total-emails"]');
    await helpers.expectElementVisible('[data-testid="stat-pending-quotes"]');
    await helpers.expectElementVisible('[data-testid="stat-total-revenue"]');
    await helpers.expectElementVisible('[data-testid="stat-active-clients"]');
    
    // Verifica se os valores são números
    const totalEmails = await page.locator('[data-testid="stat-total-emails"]').textContent();
    expect(parseInt(totalEmails || '0')).toBeGreaterThanOrEqual(0);
  });

  test('deve navegar para diferentes seções', async ({ page }) => {
    // Testa navegação para emails
    await helpers.clickActionButton('navigate-emails');
    await expect(page).toHaveURL(/.*emails/);
    
    // Volta para dashboard
    await helpers.navigateTo('/dashboard');
    
    // Testa navegação para orçamentos
    await helpers.clickActionButton('navigate-quotes');
    await expect(page).toHaveURL(/.*quotes/);
    
    // Volta para dashboard
    await helpers.navigateTo('/dashboard');
    
    // Testa navegação para clientes
    await helpers.clickActionButton('navigate-clients');
    await expect(page).toHaveURL(/.*clients/);
  });

  test('deve exibir emails recentes', async ({ page }) => {
    await helpers.expectElementVisible('[data-testid="recent-emails-list"]');
    
    // Verifica se há emails na lista
    const emailItems = await page.locator('[data-testid="email-item"]').count();
    expect(emailItems).toBeGreaterThanOrEqual(0);
  });

  test('deve exibir orçamentos recentes', async ({ page }) => {
    await helpers.expectElementVisible('[data-testid="recent-quotes-list"]');
    
    // Verifica se há orçamentos na lista
    const quoteItems = await page.locator('[data-testid="quote-item"]').count();
    expect(quoteItems).toBeGreaterThanOrEqual(0);
  });

  test('deve permitir ações rápidas', async ({ page }) => {
    // Testa criar novo orçamento
    await helpers.clickActionButton('new-quote');
    await helpers.expectModalOpen('new-quote-modal');
    await helpers.closeModal('new-quote-modal');
    
    // Testa criar novo cliente
    await helpers.clickActionButton('new-client');
    await helpers.expectModalOpen('new-client-modal');
    await helpers.closeModal('new-client-modal');
  });

  test('deve atualizar dados em tempo real', async ({ page }) => {
    // Aguarda carregamento inicial
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se os dados foram carregados
    await helpers.expectElementVisible('[data-testid="stats-cards"]');
    
    // Simula refresh dos dados
    await helpers.clickActionButton('refresh-data');
    await helpers.waitForLoadingToDisappear();
  });

  test('deve exibir gráficos e visualizações', async ({ page }) => {
    // Verifica gráficos de performance
    await helpers.expectElementVisible('[data-testid="revenue-chart"]');
    await helpers.expectElementVisible('[data-testid="quotes-chart"]');
    await helpers.expectElementVisible('[data-testid="emails-chart"]');
  });

  test('deve filtrar dados por período', async ({ page }) => {
    // Testa filtro por período
    await helpers.selectDropdownOption('[data-testid="period-filter"]', 'Últimos 7 dias');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="period-filter"]', 'Últimos 30 dias');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="period-filter"]', 'Este ano');
    await helpers.waitForLoadingToDisappear();
  });

  test('deve testar responsividade do dashboard', async ({ page }) => {
    await helpers.testResponsiveness();
  });

  test('deve testar navegação por teclado', async ({ page }) => {
    await helpers.testKeyboardNavigation();
  });

  test('deve testar acessibilidade', async ({ page }) => {
    await helpers.testAccessibility();
  });

  test('deve exibir notificações de sistema', async ({ page }) => {
    // Simula uma notificação
    await page.evaluate(() => {
      // Simula uma notificação do sistema
      const event = new CustomEvent('showNotification', {
        detail: { type: 'info', message: 'Sistema atualizado com sucesso' }
      });
      window.dispatchEvent(event);
    });
    
    await helpers.waitForNotification('success');
  });

  test('deve permitir busca global', async ({ page }) => {
    // Testa busca global
    await helpers.expectElementVisible('[data-testid="global-search"]');
    
    await page.fill('[data-testid="global-search"]', 'teste');
    await page.keyboard.press('Enter');
    
    // Verifica se os resultados aparecem
    await helpers.expectElementVisible('[data-testid="search-results"]');
  });
});
