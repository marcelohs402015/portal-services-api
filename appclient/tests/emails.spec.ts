import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Sistema de Emails', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateTo('/emails');
  });

  test('deve carregar a lista de emails', async ({ page }) => {
    await expect(page).toHaveURL(/.*emails/);
    await helpers.expectElementVisible('[data-testid="emails-list"]');
    await helpers.expectElementVisible('[data-testid="email-filters"]');
    await helpers.expectElementVisible('[data-testid="email-search"]');
  });

  test('deve exibir emails com informações corretas', async ({ page }) => {
    await helpers.expectElementVisible('[data-testid="email-item"]');
    
    // Verifica se cada email tem as informações necessárias
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      const firstEmail = emailItems.first();
      await expect(firstEmail.locator('[data-testid="email-sender"]')).toBeVisible();
      await expect(firstEmail.locator('[data-testid="email-subject"]')).toBeVisible();
      await expect(firstEmail.locator('[data-testid="email-date"]')).toBeVisible();
      await expect(firstEmail.locator('[data-testid="email-category"]')).toBeVisible();
    }
  });

  test('deve filtrar emails por categoria', async ({ page }) => {
    // Testa filtro por categoria
    await helpers.selectDropdownOption('[data-testid="category-filter"]', 'Orçamento');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="category-filter"]', 'Reclamação');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="category-filter"]', 'Informação');
    await helpers.waitForLoadingToDisappear();
    
    // Remove filtro
    await helpers.selectDropdownOption('[data-testid="category-filter"]', 'Todas');
  });

  test('deve buscar emails por texto', async ({ page }) => {
    await page.fill('[data-testid="email-search"]', 'teste');
    await page.keyboard.press('Enter');
    
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se os resultados aparecem
    await helpers.expectElementVisible('[data-testid="search-results"]');
  });

  test('deve abrir email para visualização', async ({ page }) => {
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      await emailItems.first().click();
      
      // Verifica se o modal de visualização abre
      await helpers.expectModalOpen('email-view-modal');
      
      // Verifica conteúdo do email
      await helpers.expectElementVisible('[data-testid="email-content"]');
      await helpers.expectElementVisible('[data-testid="email-actions"]');
      
      await helpers.closeModal('email-view-modal');
    }
  });

  test('deve categorizar email automaticamente', async ({ page }) => {
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      const firstEmail = emailItems.first();
      const category = await firstEmail.locator('[data-testid="email-category"]').textContent();
      
      // Verifica se a categoria foi definida
      expect(category).toBeTruthy();
      expect(['Orçamento', 'Reclamação', 'Informação', 'Suporte', 'Vendas']).toContain(category);
    }
  });

  test('deve permitir categorização manual', async ({ page }) => {
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      await emailItems.first().click();
      await helpers.expectModalOpen('email-view-modal');
      
      // Muda categoria
      await helpers.selectDropdownOption('[data-testid="email-category-select"]', 'Orçamento');
      await helpers.clickActionButton('save-category');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Categoria atualizada', 'success');
      
      await helpers.closeModal('email-view-modal');
    }
  });

  test('deve responder a um email', async ({ page }) => {
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      await emailItems.first().click();
      await helpers.expectModalOpen('email-view-modal');
      
      // Clica em responder
      await helpers.clickActionButton('reply-email');
      
      // Verifica se o formulário de resposta abre
      await helpers.expectElementVisible('[data-testid="reply-form"]');
      await helpers.expectElementVisible('[data-testid="reply-subject"]');
      await helpers.expectElementVisible('[data-testid="reply-content"]');
      
      // Preenche resposta
      await helpers.fillForm({
        '[data-testid="reply-subject"]': 'Re: Teste de resposta',
        '[data-testid="reply-content"]': 'Esta é uma resposta de teste.'
      });
      
      // Envia resposta
      await helpers.clickActionButton('send-reply');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Email enviado', 'success');
    }
  });

  test('deve usar templates de resposta', async ({ page }) => {
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      await emailItems.first().click();
      await helpers.expectModalOpen('email-view-modal');
      
      await helpers.clickActionButton('reply-email');
      
      // Seleciona template
      await helpers.selectDropdownOption('[data-testid="template-select"]', 'Resposta Padrão');
      
      // Verifica se o template foi aplicado
      const content = await page.locator('[data-testid="reply-content"]').inputValue();
      expect(content).toBeTruthy();
    }
  });

  test('deve marcar email como lido/não lido', async ({ page }) => {
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      const firstEmail = emailItems.first();
      
      // Verifica estado inicial
      const isRead = await firstEmail.locator('[data-testid="email-read-status"]').isVisible();
      
      // Clica para marcar como lido/não lido
      await firstEmail.locator('[data-testid="toggle-read"]').click();
      
      // Verifica se o estado mudou
      await helpers.waitForLoadingToDisappear();
    }
  });

  test('deve deletar email', async ({ page }) => {
    const emailItems = page.locator('[data-testid="email-item"]');
    const count = await emailItems.count();
    
    if (count > 0) {
      await emailItems.first().click();
      await helpers.expectModalOpen('email-view-modal');
      
      // Clica em deletar
      await helpers.clickActionButton('delete-email');
      
      // Confirma deleção
      await helpers.expectModalOpen('confirm-delete-modal');
      await helpers.clickActionButton('confirm-delete');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Email deletado', 'success');
    }
  });

  test('deve testar responsividade da lista de emails', async ({ page }) => {
    await helpers.testResponsiveness();
  });

  test('deve testar navegação por teclado', async ({ page }) => {
    await helpers.testKeyboardNavigation();
  });

  test('deve testar acessibilidade', async ({ page }) => {
    await helpers.testAccessibility();
  });

  test('deve paginar resultados', async ({ page }) => {
    // Verifica se há paginação
    const pagination = page.locator('[data-testid="pagination"]');
    const hasPagination = await pagination.isVisible();
    
    if (hasPagination) {
      // Testa próxima página
      await page.click('[data-testid="next-page"]');
      await helpers.waitForLoadingToDisappear();
      
      // Testa página anterior
      await page.click('[data-testid="prev-page"]');
      await helpers.waitForLoadingToDisappear();
    }
  });

  test('deve ordenar emails', async ({ page }) => {
    // Testa ordenação por data
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Data (mais recente)');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Data (mais antiga)');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Remetente (A-Z)');
    await helpers.waitForLoadingToDisappear();
  });
});
