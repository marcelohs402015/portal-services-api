import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Sistema de Clientes', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateTo('/clients');
  });

  test('deve carregar a lista de clientes', async ({ page }) => {
    await expect(page).toHaveURL(/.*clients/);
    await helpers.expectElementVisible('[data-testid="clients-list"]');
    await helpers.expectElementVisible('[data-testid="clients-filters"]');
    await helpers.expectElementVisible('[data-testid="new-client-button"]');
  });

  test('deve exibir clientes com informações corretas', async ({ page }) => {
    await helpers.expectElementVisible('[data-testid="client-item"]');
    
    // Verifica se cada cliente tem as informações necessárias
    const clientItems = page.locator('[data-testid="client-item"]');
    const count = await clientItems.count();
    
    if (count > 0) {
      const firstClient = clientItems.first();
      await expect(firstClient.locator('[data-testid="client-name"]')).toBeVisible();
      await expect(firstClient.locator('[data-testid="client-email"]')).toBeVisible();
      await expect(firstClient.locator('[data-testid="client-phone"]')).toBeVisible();
      await expect(firstClient.locator('[data-testid="client-status"]')).toBeVisible();
    }
  });

  test('deve criar novo cliente', async ({ page }) => {
    await helpers.clickActionButton('new-client');
    await helpers.expectModalOpen('new-client-modal');
    
    // Preenche formulário
    await helpers.fillForm({
      '[data-testid="client-name"]': 'Maria Santos',
      '[data-testid="client-email"]': 'maria@email.com',
      '[data-testid="client-phone"]': '(11) 99999-9999',
      '[data-testid="client-address"]': 'Rua das Flores, 123',
      '[data-testid="client-notes"]': 'Cliente preferencial'
    });
    
    // Salva cliente
    await helpers.clickActionButton('save-client');
    
    await helpers.waitForNotification('success');
    await helpers.expectNotificationContains('Cliente criado', 'success');
  });

  test('deve editar cliente existente', async ({ page }) => {
    const clientItems = page.locator('[data-testid="client-item"]');
    const count = await clientItems.count();
    
    if (count > 0) {
      await clientItems.first().click();
      await helpers.expectModalOpen('client-view-modal');
      
      // Clica em editar
      await helpers.clickActionButton('edit-client');
      
      // Modifica telefone
      await page.fill('[data-testid="client-phone"]', '(11) 88888-8888');
      
      // Salva alterações
      await helpers.clickActionButton('save-changes');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Cliente atualizado', 'success');
    }
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await helpers.clickActionButton('new-client');
    await helpers.expectModalOpen('new-client-modal');
    
    // Tenta salvar sem preencher campos obrigatórios
    await helpers.clickActionButton('save-client');
    
    // Verifica se aparecem mensagens de validação
    await helpers.expectElementVisible('[data-testid="name-error"]');
    await helpers.expectElementVisible('[data-testid="email-error"]');
  });

  test('deve validar formato de email', async ({ page }) => {
    await helpers.clickActionButton('new-client');
    await helpers.expectModalOpen('new-client-modal');
    
    await helpers.fillForm({
      '[data-testid="client-name"]': 'Teste',
      '[data-testid="client-email"]': 'email-invalido'
    });
    
    await helpers.clickActionButton('save-client');
    
    await helpers.expectElementVisible('[data-testid="email-error"]');
    await helpers.expectElementContainsText('[data-testid="email-error"]', 'Email inválido');
  });

  test('deve filtrar clientes por status', async ({ page }) => {
    // Testa filtro por status
    await helpers.selectDropdownOption('[data-testid="status-filter"]', 'Ativo');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="status-filter"]', 'Inativo');
    await helpers.waitForLoadingToDisappear();
    
    // Remove filtro
    await helpers.selectDropdownOption('[data-testid="status-filter"]', 'Todos');
  });

  test('deve buscar clientes por nome', async ({ page }) => {
    await page.fill('[data-testid="client-search"]', 'João');
    await page.keyboard.press('Enter');
    
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se os resultados aparecem
    await helpers.expectElementVisible('[data-testid="search-results"]');
  });

  test('deve visualizar histórico do cliente', async ({ page }) => {
    const clientItems = page.locator('[data-testid="client-item"]');
    const count = await clientItems.count();
    
    if (count > 0) {
      await clientItems.first().click();
      await helpers.expectModalOpen('client-view-modal');
      
      // Clica em ver histórico
      await helpers.clickActionButton('view-history');
      
      // Verifica se o histórico aparece
      await helpers.expectElementVisible('[data-testid="client-history"]');
      await helpers.expectElementVisible('[data-testid="quotes-history"]');
      await helpers.expectElementVisible('[data-testid="emails-history"]');
    }
  });

  test('deve ativar/desativar cliente', async ({ page }) => {
    const clientItems = page.locator('[data-testid="client-item"]');
    const count = await clientItems.count();
    
    if (count > 0) {
      await clientItems.first().click();
      await helpers.expectModalOpen('client-view-modal');
      
      // Verifica status atual
      const currentStatus = await page.locator('[data-testid="client-status"]').textContent();
      
      // Muda status
      await helpers.clickActionButton('toggle-status');
      
      await helpers.waitForNotification('success');
      
      // Verifica se o status mudou
      const newStatus = await page.locator('[data-testid="client-status"]').textContent();
      expect(newStatus).not.toBe(currentStatus);
    }
  });

  test('deve enviar email para cliente', async ({ page }) => {
    const clientItems = page.locator('[data-testid="client-item"]');
    const count = await clientItems.count();
    
    if (count > 0) {
      await clientItems.first().click();
      await helpers.expectModalOpen('client-view-modal');
      
      // Clica em enviar email
      await helpers.clickActionButton('send-email');
      
      // Verifica se o modal de email abre
      await helpers.expectElementVisible('[data-testid="email-form"]');
      await helpers.expectElementVisible('[data-testid="email-subject"]');
      await helpers.expectElementVisible('[data-testid="email-content"]');
      
      // Preenche email
      await helpers.fillForm({
        '[data-testid="email-subject"]': 'Contato - Portal Services',
        '[data-testid="email-content"]': 'Olá! Como podemos ajudar?'
      });
      
      // Envia email
      await helpers.clickActionButton('send-email');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Email enviado', 'success');
    }
  });

  test('deve deletar cliente', async ({ page }) => {
    const clientItems = page.locator('[data-testid="client-item"]');
    const count = await clientItems.count();
    
    if (count > 0) {
      await clientItems.first().click();
      await helpers.expectModalOpen('client-view-modal');
      
      // Clica em deletar
      await helpers.clickActionButton('delete-client');
      
      // Confirma deleção
      await helpers.expectModalOpen('confirm-delete-modal');
      await helpers.clickActionButton('confirm-delete');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Cliente deletado', 'success');
    }
  });

  test('deve exportar lista de clientes', async ({ page }) => {
    // Clica em exportar
    await helpers.clickActionButton('export-clients');
    
    // Seleciona formato
    await helpers.selectDropdownOption('[data-testid="export-format"]', 'Excel');
    
    // Inicia exportação
    const downloadPromise = page.waitForEvent('download');
    await helpers.clickActionButton('start-export');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('deve testar responsividade da lista de clientes', async ({ page }) => {
    await helpers.testResponsiveness();
  });

  test('deve testar navegação por teclado', async ({ page }) => {
    await helpers.testKeyboardNavigation();
  });

  test('deve testar acessibilidade', async ({ page }) => {
    await helpers.testAccessibility();
  });

  test('deve ordenar clientes', async ({ page }) => {
    // Testa ordenação por nome
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Nome (A-Z)');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Nome (Z-A)');
    await helpers.waitForLoadingToDisappear();
    
    await helpers.selectDropdownOption('[data-testid="sort-select"]', 'Data de cadastro');
    await helpers.waitForLoadingToDisappear();
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

  test('deve mostrar estatísticas do cliente', async ({ page }) => {
    const clientItems = page.locator('[data-testid="client-item"]');
    const count = await clientItems.count();
    
    if (count > 0) {
      await clientItems.first().click();
      await helpers.expectModalOpen('client-view-modal');
      
      // Verifica estatísticas
      await helpers.expectElementVisible('[data-testid="client-stats"]');
      await helpers.expectElementVisible('[data-testid="total-quotes"]');
      await helpers.expectElementVisible('[data-testid="total-revenue"]');
      await helpers.expectElementVisible('[data-testid="last-contact"]');
    }
  });
});
