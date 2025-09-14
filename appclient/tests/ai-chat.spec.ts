import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Sistema de IA Chat', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateTo('/chat');
  });

  test('deve carregar o chat de IA', async ({ page }) => {
    await expect(page).toHaveURL(/.*chat/);
    await helpers.expectElementVisible('[data-testid="chat-container"]');
    await helpers.expectElementVisible('[data-testid="chat-messages"]');
    await helpers.expectElementVisible('[data-testid="chat-input"]');
    await helpers.expectElementVisible('[data-testid="send-button"]');
  });

  test('deve enviar mensagem e receber resposta', async ({ page }) => {
    // Envia mensagem
    await page.fill('[data-testid="chat-input"]', 'Olá, como você pode me ajudar?');
    await helpers.clickActionButton('send-message');
    
    // Aguarda resposta da IA
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se a resposta apareceu
    await helpers.expectElementVisible('[data-testid="ai-response"]');
    
    // Verifica se a mensagem do usuário aparece
    await helpers.expectElementVisible('[data-testid="user-message"]');
  });

  test('deve categorizar automaticamente a mensagem', async ({ page }) => {
    // Envia mensagem sobre orçamento
    await page.fill('[data-testid="chat-input"]', 'Preciso de um orçamento para pintura');
    await helpers.clickActionButton('send-message');
    
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se a categoria foi detectada
    await helpers.expectElementVisible('[data-testid="message-category"]');
    await helpers.expectElementContainsText('[data-testid="message-category"]', 'Orçamento');
  });

  test('deve sugerir ações baseadas na mensagem', async ({ page }) => {
    // Envia mensagem que deve gerar sugestões
    await page.fill('[data-testid="chat-input"]', 'Quero criar um orçamento');
    await helpers.clickActionButton('send-message');
    
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se as sugestões aparecem
    await helpers.expectElementVisible('[data-testid="suggested-actions"]');
    await helpers.expectElementVisible('[data-testid="action-create-quote"]');
  });

  test('deve executar ação sugerida', async ({ page }) => {
    // Envia mensagem
    await page.fill('[data-testid="chat-input"]', 'Criar orçamento');
    await helpers.clickActionButton('send-message');
    
    await helpers.waitForLoadingToDisappear();
    
    // Clica em ação sugerida
    await helpers.clickActionButton('action-create-quote');
    
    // Verifica se o modal de orçamento abre
    await helpers.expectModalOpen('new-quote-modal');
    await helpers.closeModal('new-quote-modal');
  });

  test('deve manter histórico de conversa', async ({ page }) => {
    // Envia primeira mensagem
    await page.fill('[data-testid="chat-input"]', 'Primeira mensagem');
    await helpers.clickActionButton('send-message');
    await helpers.waitForLoadingToDisappear();
    
    // Envia segunda mensagem
    await page.fill('[data-testid="chat-input"]', 'Segunda mensagem');
    await helpers.clickActionButton('send-message');
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se ambas as mensagens estão no histórico
    const messages = page.locator('[data-testid="chat-message"]');
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(4); // 2 mensagens do usuário + 2 respostas da IA
  });

  test('deve limpar histórico de conversa', async ({ page }) => {
    // Envia algumas mensagens
    await page.fill('[data-testid="chat-input"]', 'Mensagem de teste');
    await helpers.clickActionButton('send-message');
    await helpers.waitForLoadingToDisappear();
    
    // Clica em limpar histórico
    await helpers.clickActionButton('clear-chat');
    
    // Confirma limpeza
    await helpers.expectModalOpen('confirm-clear-modal');
    await helpers.clickActionButton('confirm-clear');
    
    // Verifica se o chat foi limpo
    const messages = page.locator('[data-testid="chat-message"]');
    const count = await messages.count();
    expect(count).toBe(0);
  });

  test('deve exportar conversa', async ({ page }) => {
    // Envia mensagem
    await page.fill('[data-testid="chat-input"]', 'Mensagem para exportar');
    await helpers.clickActionButton('send-message');
    await helpers.waitForLoadingToDisappear();
    
    // Clica em exportar
    await helpers.clickActionButton('export-chat');
    
    // Verifica se o download foi iniciado
    const downloadPromise = page.waitForEvent('download');
    await helpers.clickActionButton('download-chat');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.txt');
  });

  test('deve usar templates de resposta', async ({ page }) => {
    // Envia mensagem que deve usar template
    await page.fill('[data-testid="chat-input"]', 'Como faço para solicitar um orçamento?');
    await helpers.clickActionButton('send-message');
    
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se a resposta usa template
    const response = await page.locator('[data-testid="ai-response"]').textContent();
    expect(response).toContain('orçamento');
  });

  test('deve detectar intenção do usuário', async ({ page }) => {
    // Testa diferentes intenções
    const intentions = [
      { message: 'Quero um orçamento', expected: 'quote' },
      { message: 'Tenho uma reclamação', expected: 'complaint' },
      { message: 'Preciso de informações', expected: 'information' }
    ];
    
    for (const intention of intentions) {
      await page.fill('[data-testid="chat-input"]', intention.message);
      await helpers.clickActionButton('send-message');
      await helpers.waitForLoadingToDisappear();
      
      // Verifica se a intenção foi detectada
      await helpers.expectElementVisible('[data-testid="detected-intention"]');
    }
  });

  test('deve fornecer respostas contextualizadas', async ({ page }) => {
    // Envia mensagem inicial
    await page.fill('[data-testid="chat-input"]', 'Sou cliente João Silva');
    await helpers.clickActionButton('send-message');
    await helpers.waitForLoadingToDisappear();
    
    // Envia mensagem de follow-up
    await page.fill('[data-testid="chat-input"]', 'Qual foi meu último orçamento?');
    await helpers.clickActionButton('send-message');
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se a resposta é contextualizada
    const response = await page.locator('[data-testid="ai-response"]').last().textContent();
    expect(response).toContain('João Silva');
  });

  test('deve lidar com mensagens vazias', async ({ page }) => {
    // Tenta enviar mensagem vazia
    await helpers.clickActionButton('send-message');
    
    // Verifica se aparece mensagem de erro
    await helpers.expectElementVisible('[data-testid="empty-message-error"]');
  });

  test('deve lidar com mensagens muito longas', async ({ page }) => {
    // Cria mensagem muito longa
    const longMessage = 'A'.repeat(1000);
    await page.fill('[data-testid="chat-input"]', longMessage);
    await helpers.clickActionButton('send-message');
    
    // Verifica se aparece mensagem de erro
    await helpers.expectElementVisible('[data-testid="message-too-long-error"]');
  });

  test('deve mostrar indicador de digitação', async ({ page }) => {
    // Envia mensagem
    await page.fill('[data-testid="chat-input"]', 'Mensagem de teste');
    await helpers.clickActionButton('send-message');
    
    // Verifica se o indicador de digitação aparece
    await helpers.expectElementVisible('[data-testid="typing-indicator"]');
    
    // Aguarda resposta
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se o indicador desapareceu
    await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible();
  });

  test('deve permitir envio por Enter', async ({ page }) => {
    // Envia mensagem usando Enter
    await page.fill('[data-testid="chat-input"]', 'Mensagem com Enter');
    await page.keyboard.press('Enter');
    
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se a mensagem foi enviada
    await helpers.expectElementVisible('[data-testid="user-message"]');
  });

  test('deve testar responsividade do chat', async ({ page }) => {
    await helpers.testResponsiveness();
  });

  test('deve testar navegação por teclado', async ({ page }) => {
    await helpers.testKeyboardNavigation();
  });

  test('deve testar acessibilidade', async ({ page }) => {
    await helpers.testAccessibility();
  });

  test('deve mostrar confiança da IA', async ({ page }) => {
    // Envia mensagem
    await page.fill('[data-testid="chat-input"]', 'Mensagem de teste');
    await helpers.clickActionButton('send-message');
    
    await helpers.waitForLoadingToDisappear();
    
    // Verifica se o nível de confiança aparece
    await helpers.expectElementVisible('[data-testid="ai-confidence"]');
    
    const confidence = await page.locator('[data-testid="ai-confidence"]').textContent();
    expect(confidence).toMatch(/\d+%/);
  });

  test('deve permitir feedback da resposta', async ({ page }) => {
    // Envia mensagem
    await page.fill('[data-testid="chat-input"]', 'Mensagem para feedback');
    await helpers.clickActionButton('send-message');
    
    await helpers.waitForLoadingToDisappear();
    
    // Clica em feedback positivo
    await helpers.clickActionButton('feedback-positive');
    
    await helpers.waitForNotification('success');
    await helpers.expectNotificationContains('Feedback enviado', 'success');
  });
});
