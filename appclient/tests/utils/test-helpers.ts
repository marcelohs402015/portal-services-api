import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Aguarda a página carregar completamente
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Faz login no sistema
   */
  async login(email: string = 'admin@portalservices.com', password: string = 'password123') {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForURL('**/dashboard');
  }

  /**
   * Navega para uma página específica
   */
  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Verifica se um elemento está visível
   */
  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Verifica se um elemento contém texto
   */
  async expectElementContainsText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  /**
   * Preenche um formulário
   */
  async fillForm(formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await this.page.fill(selector, value);
    }
  }

  /**
   * Submete um formulário
   */
  async submitForm(buttonSelector: string = '[data-testid="submit-button"]') {
    await this.page.click(buttonSelector);
  }

  /**
   * Aguarda uma notificação aparecer
   */
  async waitForNotification(type: 'success' | 'error' | 'warning' = 'success') {
    await this.page.waitForSelector(`[data-testid="notification-${type}"]`);
  }

  /**
   * Verifica se uma notificação contém texto
   */
  async expectNotificationContains(text: string, type: 'success' | 'error' | 'warning' = 'success') {
    await this.expectElementContainsText(`[data-testid="notification-${type}"]`, text);
  }

  /**
   * Clica em um botão de ação
   */
  async clickActionButton(action: string) {
    await this.page.click(`[data-testid="action-${action}"]`);
  }

  /**
   * Verifica se um modal está aberto
   */
  async expectModalOpen(modalId: string) {
    await this.expectElementVisible(`[data-testid="modal-${modalId}"]`);
  }

  /**
   * Fecha um modal
   */
  async closeModal(modalId: string) {
    await this.page.click(`[data-testid="modal-${modalId}"] [data-testid="close-button"]`);
  }

  /**
   * Seleciona uma opção em um dropdown
   */
  async selectDropdownOption(dropdownSelector: string, optionText: string) {
    await this.page.click(dropdownSelector);
    await this.page.click(`text=${optionText}`);
  }

  /**
   * Verifica se uma tabela contém dados
   */
  async expectTableHasData(tableSelector: string) {
    const rows = await this.page.locator(`${tableSelector} tbody tr`).count();
    expect(rows).toBeGreaterThan(0);
  }

  /**
   * Verifica se uma tabela está vazia
   */
  async expectTableEmpty(tableSelector: string) {
    const rows = await this.page.locator(`${tableSelector} tbody tr`).count();
    expect(rows).toBe(0);
  }

  /**
   * Aguarda um loading desaparecer
   */
  async waitForLoadingToDisappear() {
    await this.page.waitForSelector('[data-testid="loading"]', { state: 'hidden' });
  }

  /**
   * Verifica responsividade em diferentes tamanhos de tela
   */
  async testResponsiveness() {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(1000);
      
      // Verifica se elementos principais estão visíveis
      await this.expectElementVisible('[data-testid="main-content"]');
    }
  }

  /**
   * Testa navegação por teclado
   */
  async testKeyboardNavigation() {
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(500);
  }

  /**
   * Verifica acessibilidade básica
   */
  async testAccessibility() {
    // Verifica se elementos têm labels
    const inputs = await this.page.locator('input[type="text"], input[type="email"], input[type="password"]').count();
    for (let i = 0; i < inputs; i++) {
      const input = this.page.locator('input[type="text"], input[type="email"], input[type="password"]').nth(i);
      const hasLabel = await input.getAttribute('aria-label') || await input.getAttribute('id');
      expect(hasLabel).toBeTruthy();
    }
  }
}
