import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Sistema de Orçamentos', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateTo('/quotes');
  });

  test('deve carregar a lista de orçamentos', async ({ page }) => {
    await expect(page).toHaveURL(/.*quotes/);
    await helpers.expectElementVisible('[data-testid="quotes-list"]');
    await helpers.expectElementVisible('[data-testid="quotes-filters"]');
    await helpers.expectElementVisible('[data-testid="new-quote-button"]');
  });

  test('deve exibir orçamentos com informações corretas', async ({ page }) => {
    await helpers.expectElementVisible('[data-testid="quote-item"]');
    
    // Verifica se cada orçamento tem as informações necessárias
    const quoteItems = page.locator('[data-testid="quote-item"]');
    const count = await quoteItems.count();
    
    if (count > 0) {
      const firstQuote = quoteItems.first();
      await expect(firstQuote.locator('[data-testid="quote-client"]')).toBeVisible();
      await expect(firstQuote.locator('[data-testid="quote-value"]')).toBeVisible();
      await expect(firstQuote.locator('[data-testid="quote-status"]')).toBeVisible();
      await expect(firstQuote.locator('[data-testid="quote-date"]')).toBeVisible();
    }
  });

  test('deve criar novo orçamento', async ({ page }) => {
    await helpers.clickActionButton('new-quote');
    await helpers.expectModalOpen('new-quote-modal');
    
    // Preenche formulário
    await helpers.fillForm({
      '[data-testid="quote-client-select"]': 'João Silva',
      '[data-testid="quote-description"]': 'Reparo elétrico residencial',
      '[data-testid="quote-value"]': '150.00',
      '[data-testid="quote-notes"]': 'Inclui material e mão de obra'
    });
    
    // Seleciona serviços
    await helpers.clickActionButton('add-service');
    await helpers.fillForm({
      '[data-testid="service-name"]': 'Instalação de tomada',
      '[data-testid="service-value"]': '50.00'
    });
    await helpers.clickActionButton('save-service');
    
    // Salva orçamento
    await helpers.clickActionButton('save-quote');
    
    await helpers.waitForNotification('success');
    await helpers.expectNotificationContains('Orçamento criado', 'success');
  });

  test('deve editar orçamento existente', async ({ page }) => {
    const quoteItems = page.locator('[data-testid="quote-item"]');
    const count = await quoteItems.count();
    
    if (count > 0) {
      await quoteItems.first().click();
      await helpers.expectModalOpen('quote-view-modal');
      
      // Clica em editar
      await helpers.clickActionButton('edit-quote');
      
      // Modifica valor
      await page.fill('[data-testid="quote-value"]', '200.00');
      
      // Salva alterações
      await helpers.clickActionButton('save-changes');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Orçamento atualizado', 'success');
    }
  });

  test('deve enviar orçamento por email', async ({ page }) => {
    const quoteItems = page.locator('[data-testid="quote-item"]');
    const count = await quoteItems.count();
    
    if (count > 0) {
      await quoteItems.first().click();
      await helpers.expectModalOpen('quote-view-modal');
      
      // Clica em enviar por email
      await helpers.clickActionButton('send-quote-email');
      
      // Verifica se o modal de envio abre
      await helpers.expectElementVisible('[data-testid="email-form"]');
      await helpers.expectElementVisible('[data-testid="email-subject"]');
      await helpers.expectElementVisible('[data-testid="email-content"]');
      
      // Preenche email
      await helpers.fillForm({
        '[data-testid="email-subject"]': 'Orçamento - Reparo Elétrico',
        '[data-testid="email-content"]': 'Segue em anexo o orçamento solicitado.'
      });
      
      // Envia email
      await helpers.clickActionButton('send-email');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Orçamento enviado', 'success');
    }
  });

  test('deve aprovar/rejeitar orçamento', async ({ page }) => {
    const quoteItems = page.locator('[data-testid="quote-item"]');
    const count = await quoteItems.count();
    
    if (count > 0) {
      await quoteItems.first().click();
      await helpers.expectModalOpen('quote-view-modal');
      
      // Aprova orçamento
      await helpers.clickActionButton('approve-quote');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Orçamento aprovado', 'success');
      
      // Verifica se o status mudou
      await helpers.expectElementContainsText('[data-testid="quote-status"]', 'Aprovado');
    }
  });

  test('deve filtrar orçamentos por status', async ({ page }) => {
    // Testa filtro por status
    await helpers.selectDropdownOption('[data-testid="status-filter"]', 'Pendente');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="status-filter"]', 'Aprovado');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="status-filter"]', 'Rejeitado');
    await helpers.waitForLoadingToDisappear();
    
    // Remove filtro
    await helpers.selectDropdownOption('[data-testid="status-filter"]', 'Todos');
  });

  test('deve filtrar orçamentos por cliente', async ({ page }) => {
    await helpers.selectDropdownOption('[data-testid="client-filter"]', 'João Silva');
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se apenas orçamentos do cliente aparecem
    const quoteItems = page.locator('[data-testid="quote-item"]');
    const count = await quoteItems.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const clientName = await quoteItems.nth(i).locator('[data-testid="quote-client"]').textContent();
        expect(clientName).toContain('João Silva');
      }
    }
  });

  test('deve buscar orçamentos', async ({ page }) => {
    await page.fill('[data-testid="quote-search"]', 'elétrico');
    await page.keyboard.press('Enter');
    
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se os resultados aparecem
    await helpers.expectElementVisible('[data-testid="search-results"]');
  });

  test('deve calcular total automaticamente', async ({ page }) => {
    await helpers.clickActionButton('new-quote');
    await helpers.expectModalOpen('new-quote-modal');
    
    // Adiciona serviços
    await helpers.clickActionButton('add-service');
    await helpers.fillForm({
      '[data-testid="service-name"]': 'Serviço 1',
      '[data-testid="service-value"]': '100.00'
    });
    await helpers.clickActionButton('save-service');
    
    await helpers.clickActionButton('add-service');
    await helpers.fillForm({
      '[data-testid="service-name"]': 'Serviço 2',
      '[data-testid="service-value"]': '50.00'
    });
    await helpers.clickActionButton('save-service');
    
    // Verifica se o total foi calculado
    const total = await page.locator('[data-testid="quote-total"]').textContent();
    expect(total).toContain('150.00');
  });

  test('deve aplicar desconto', async ({ page }) => {
    await helpers.clickActionButton('new-quote');
    await helpers.expectModalOpen('new-quote-modal');
    
    // Adiciona valor base
    await helpers.fillForm({
      '[data-testid="quote-value"]': '200.00'
    });
    
    // Aplica desconto
    await helpers.fillForm({
      '[data-testid="quote-discount"]': '10'
    });
    
    // Verifica se o desconto foi aplicado
    const total = await page.locator('[data-testid="quote-total"]').textContent();
    expect(total).toContain('180.00');
  });

  test('deve gerar PDF do orçamento', async ({ page }) => {
    const quoteItems = page.locator('[data-testid="quote-item"]');
    const count = await quoteItems.count();
    
    if (count > 0) {
      await quoteItems.first().click();
      await helpers.expectModalOpen('quote-view-modal');
      
      // Clica em gerar PDF
      await helpers.clickActionButton('generate-pdf');
      
      // Verifica se o download foi iniciado
      const downloadPromise = page.waitForEvent('download');
      await helpers.clickActionButton('download-pdf');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('.pdf');
    }
  });

  test('deve deletar orçamento', async ({ page }) => {
    const quoteItems = page.locator('[data-testid="quote-item"]');
    const count = await quoteItems.count();
    
    if (count > 0) {
      await quoteItems.first().click();
      await helpers.expectModalOpen('quote-view-modal');
      
      // Clica em deletar
      await helpers.clickActionButton('delete-quote');
      
      // Confirma deleção
      await helpers.expectModalOpen('confirm-delete-modal');
      await helpers.clickActionButton('confirm-delete');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Orçamento deletado', 'success');
    }
  });

  test('deve testar responsividade da lista de orçamentos', async ({ page }) => {
    await helpers.testResponsiveness();
  });

  test('deve testar navegação por teclado', async ({ page }) => {
    await helpers.testKeyboardNavigation();
  });

  test('deve testar acessibilidade', async ({ page }) => {
    await helpers.testAccessibility();
  });

  test('deve ordenar orçamentos', async ({ page }) => {
    // Testa ordenação por valor
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Valor (maior)');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Valor (menor)');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Data (mais recente)');
    await helpers.waitForLoadingToDisappear();
  });

  test('deve exportar orçamentos', async ({ page }) => {
    // Clica em exportar
    await helpers.clickActionButton('export-quotes');
    
    // Seleciona formato
    await helpers.selectDropdownOption('[data-testid="export-format"]', 'Excel');
    
    // Inicia exportação
    const downloadPromise = page.waitForEvent('download');
    await helpers.clickActionButton('start-export');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
