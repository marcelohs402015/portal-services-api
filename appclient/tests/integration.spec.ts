import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Testes de Integração - Fluxos Completos', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
  });

  test('fluxo completo: email → orçamento → aprovação', async ({ page }) => {
    // 1. Receber email
    await helpers.navigateTo('/emails');
    await helpers.expectElementVisible('[data-testid="emails-list"]');
    
    // 2. Abrir email
    const emailItems = page.locator('[data-testid="email-item"]');
    const emailCount = await emailItems.count();
    
    if (emailCount > 0) {
      await emailItems.first().click();
      await helpers.expectModalOpen('email-view-modal');
      
      // 3. Verificar categorização automática
      await helpers.expectElementVisible('[data-testid="email-category"]');
      
      // 4. Gerar orçamento a partir do email
      await helpers.clickActionButton('generate-quote-from-email');
      await helpers.expectModalOpen('new-quote-modal');
      
      // 5. Preencher orçamento
      await helpers.fillForm({
        '[data-testid="quote-value"]': '250.00',
        '[data-testid="quote-notes"]': 'Orçamento gerado automaticamente do email'
      });
      
      // 6. Salvar orçamento
      await helpers.clickActionButton('save-quote');
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Orçamento criado', 'success');
      
      // 7. Voltar para emails e verificar status
      await helpers.closeModal('new-quote-modal');
      await helpers.closeModal('email-view-modal');
      
      // 8. Verificar se o email foi marcado como processado
      await helpers.expectElementContainsText('[data-testid="email-status"]', 'Processado');
    }
  });

  test('fluxo completo: chat IA → criação de cliente → orçamento', async ({ page }) => {
    // 1. Iniciar chat
    await helpers.navigateTo('/chat');
    await helpers.expectElementVisible('[data-testid="chat-container"]');
    
    // 2. Enviar mensagem sobre novo cliente
    await page.fill('[data-testid="chat-input"]', 'Quero cadastrar um novo cliente');
    await helpers.clickActionButton('send-message');
    await helpers.waitForLoadingToDisappear();
    
    // 3. Verificar sugestão de ação
    await helpers.expectElementVisible('[data-testid="suggested-actions"]');
    await helpers.clickActionButton('action-create-client');
    
    // 4. Preencher dados do cliente
    await helpers.expectModalOpen('new-client-modal');
    await helpers.fillForm({
      '[data-testid="client-name"]': 'Pedro Oliveira',
      '[data-testid="client-email"]': 'pedro@email.com',
      '[data-testid="client-phone"]': '(11) 77777-7777'
    });
    
    // 5. Salvar cliente
    await helpers.clickActionButton('save-client');
    await helpers.waitForNotification('success');
    await helpers.expectNotificationContains('Cliente criado', 'success');
    await helpers.closeModal('new-client-modal');
    
    // 6. Criar orçamento para o novo cliente
    await helpers.navigateTo('/quotes');
    await helpers.clickActionButton('new-quote');
    await helpers.expectModalOpen('new-quote-modal');
    
    // 7. Selecionar o cliente recém-criado
    await helpers.selectDropdownOption('[data-testid="quote-client-select"]', 'Pedro Oliveira');
    await helpers.fillForm({
      '[data-testid="quote-description"]': 'Serviço de pintura residencial',
      '[data-testid="quote-value"]': '300.00'
    });
    
    // 8. Salvar orçamento
    await helpers.clickActionButton('save-quote');
    await helpers.waitForNotification('success');
    await helpers.expectNotificationContains('Orçamento criado', 'success');
  });

  test('fluxo completo: dashboard → relatórios → exportação', async ({ page }) => {
    // 1. Acessar dashboard
    await helpers.navigateTo('/dashboard');
    await helpers.expectElementVisible('[data-testid="dashboard-header"]');
    
    // 2. Verificar estatísticas
    await helpers.expectElementVisible('[data-testid="stats-cards"]');
    
    // 3. Filtrar por período
    await helpers.selectDropdownOption('[data-testid="period-filter"]', 'Últimos 30 dias');
    await helpers.waitForLoadingToDisappear();
    
    // 4. Verificar gráficos
    await helpers.expectElementVisible('[data-testid="revenue-chart"]');
    await helpers.expectElementVisible('[data-testid="quotes-chart"]');
    
    // 5. Exportar relatório
    await helpers.clickActionButton('export-report');
    await helpers.selectDropdownOption('[data-testid="report-format"]', 'PDF');
    
    const downloadPromise = page.waitForEvent('download');
    await helpers.clickActionButton('generate-report');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('fluxo completo: busca global → resultados → ações', async ({ page }) => {
    // 1. Usar busca global
    await helpers.expectElementVisible('[data-testid="global-search"]');
    await page.fill('[data-testid="global-search"]', 'João');
    await page.keyboard.press('Enter');
    
    // 2. Verificar resultados
    await helpers.expectElementVisible('[data-testid="search-results"]');
    
    // 3. Filtrar resultados
    await helpers.selectDropdownOption('[data-testid="search-filter"]', 'Clientes');
    await helpers.waitForLoadingToDisappear();
    
    // 4. Selecionar resultado
    const results = page.locator('[data-testid="search-result-item"]');
    const resultCount = await results.count();
    
    if (resultCount > 0) {
      await results.first().click();
      
      // 5. Verificar se abriu detalhes
      await helpers.expectElementVisible('[data-testid="detail-view"]');
      
      // 6. Executar ação
      await helpers.clickActionButton('send-email');
      await helpers.expectElementVisible('[data-testid="email-form"]');
    }
  });

  test('fluxo completo: notificações → ações → feedback', async ({ page }) => {
    // 1. Simular notificação
    await page.evaluate(() => {
      const event = new CustomEvent('showNotification', {
        detail: { 
          type: 'info', 
          message: 'Novo email recebido de cliente',
          action: 'view-email'
        }
      });
      window.dispatchEvent(event);
    });
    
    // 2. Verificar notificação
    await helpers.waitForNotification('success');
    await helpers.expectNotificationContains('Novo email recebido', 'success');
    
    // 3. Clicar na ação da notificação
    await helpers.clickActionButton('view-email');
    
    // 4. Verificar se navegou para emails
    await expect(page).toHaveURL(/.*emails/);
    
    // 5. Marcar como lido
    const emailItems = page.locator('[data-testid="email-item"]');
    const emailCount = await emailItems.count();
    
    if (emailCount > 0) {
      await emailItems.first().click();
      await helpers.expectModalOpen('email-view-modal');
      
      // 6. Responder email
      await helpers.clickActionButton('reply-email');
      await helpers.fillForm({
        '[data-testid="reply-content"]': 'Resposta automática via notificação'
      });
      await helpers.clickActionButton('send-reply');
      
      await helpers.waitForNotification('success');
      await helpers.expectNotificationContains('Email enviado', 'success');
    }
  });

  test('fluxo completo: responsividade → acessibilidade → performance', async ({ page }) => {
    // 1. Testar responsividade
    await helpers.navigateTo('/dashboard');
    await helpers.testResponsiveness();
    
    // 2. Testar acessibilidade
    await helpers.testAccessibility();
    
    // 3. Testar navegação por teclado
    await helpers.testKeyboardNavigation();
    
    // 4. Verificar performance
    const startTime = Date.now();
    await page.reload();
    await helpers.waitForPageLoad();
    const loadTime = Date.now() - startTime;
    
    // Verifica se carregou em menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });

  test('fluxo completo: autenticação → sessão → logout', async ({ page }) => {
    // 1. Verificar se está logado
    await helpers.navigateTo('/dashboard');
    await helpers.expectElementVisible('[data-testid="dashboard"]');
    
    // 2. Verificar informações do usuário
    await helpers.expectElementVisible('[data-testid="user-profile"]');
    
    // 3. Acessar perfil
    await helpers.clickActionButton('view-profile');
    await helpers.expectModalOpen('profile-modal');
    
    // 4. Verificar dados do perfil
    await helpers.expectElementVisible('[data-testid="profile-name"]');
    await helpers.expectElementVisible('[data-testid="profile-email"]');
    
    // 5. Fazer logout
    await helpers.closeModal('profile-modal');
    await helpers.clickActionButton('logout');
    
    // 6. Verificar se foi redirecionado para login
    await expect(page).toHaveURL(/.*login/);
    await helpers.expectElementVisible('[data-testid="login-form"]');
  });

  test('fluxo completo: configurações → personalização → salvamento', async ({ page }) => {
    // 1. Acessar configurações
    await helpers.clickActionButton('settings');
    await helpers.expectModalOpen('settings-modal');
    
    // 2. Alterar tema
    await helpers.selectDropdownOption('[data-testid="theme-select"]', 'Dark');
    
    // 3. Alterar idioma
    await helpers.selectDropdownOption('[data-testid="language-select"]', 'English');
    
    // 4. Configurar notificações
    await page.check('[data-testid="email-notifications"]');
    await page.uncheck('[data-testid="push-notifications"]');
    
    // 5. Salvar configurações
    await helpers.clickActionButton('save-settings');
    await helpers.waitForNotification('success');
    await helpers.expectNotificationContains('Configurações salvas', 'success');
    
    // 6. Verificar se as mudanças foram aplicadas
    await helpers.closeModal('settings-modal');
    
    // Verifica se o tema mudou
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark');
  });
});
