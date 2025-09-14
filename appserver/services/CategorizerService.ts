import { EmailData, Categories, CategorizationResult, CategoryDefinition } from '../types/email';
import { Logger } from 'winston';
import { createLogger } from '../shared/logger';

export class CategorizerService {
  private categories: Categories;
  private logger: Logger;

  constructor() {
    this.logger = createLogger('CategorizerService');
    this.categories = {
      complaint: {
        keywords: ['reclamação', 'reclamar', 'problema', 'defeito', 'erro', 'falha', 'insatisfação', 'ruim', 'péssimo', 'horrível'],
        patterns: [
          /\b(problema|defeito|erro|falha)\b/i,
          /\b(reclamação|reclamar|insatisfação)\b/i,
          /\b(ruim|péssimo|horrível|terrível)\b/i,
          /não funciona/i,
          /não está funcionando/i
        ],
        domains: []
      },
      quote: {
        keywords: ['orçamento', 'cotação', 'preço', 'valor', 'custo', 'proposta', 'estimativa', 'quanto custa'],
        patterns: [
          /\b(orçamento|cotação|preço|valor)\b/i,
          /\b(proposta|estimativa|custo)\b/i,
          /quanto custa/i,
          /valor.*do.*produto/i,
          /preço.*de/i
        ],
        domains: []
      },
      product_info: {
        keywords: ['informações', 'detalhes', 'especificação', 'características', 'manual', 'como usar', 'funciona', 'dúvida'],
        patterns: [
          /\b(informações|detalhes|especificação)\b/i,
          /\b(características|manual|como.*usar)\b/i,
          /\b(funciona|dúvida|pergunta)\b/i,
          /mais.*informações/i,
          /gostaria.*de.*saber/i
        ],
        domains: []
      },
      support: {
        keywords: ['suporte', 'ajuda', 'assistência', 'tutorial', 'guia', 'documentação', 'como fazer'],
        patterns: [
          /\b(suporte|ajuda|assistência)\b/i,
          /\b(tutorial|guia|documentação)\b/i,
          /como.*fazer/i,
          /preciso.*de.*ajuda/i,
          /pode.*me.*ajudar/i
        ],
        domains: []
      },
      sales: {
        keywords: ['comprar', 'venda', 'pedido', 'encomenda', 'interesse', 'adquirir', 'disponibilidade'],
        patterns: [
          /\b(comprar|venda|pedido|encomenda)\b/i,
          /\b(interesse|adquirir|disponibilidade)\b/i,
          /gostaria.*de.*comprar/i,
          /tenho.*interesse/i,
          /está.*disponível/i
        ],
        domains: []
      }
    };
  }

  categorizeEmail(email: EmailData): Omit<CategorizationResult, 'id' | 'email'> {
    const { subject, from, body, snippet } = email;
    const content = `${subject} ${body} ${snippet}`.toLowerCase();
    const fromEmail = from.toLowerCase();
    
    const scores: Record<string, number> = {};
    
    // Initialize scores for all categories
    Object.keys(this.categories).forEach(category => {
      scores[category] = 0;
    });

    // Score based on keywords, patterns, and domains
    Object.entries(this.categories).forEach(([categoryName, category]) => {
      // Keyword matching
      category.keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          scores[categoryName] += 2;
        }
      });

      // Pattern matching
      category.patterns.forEach(pattern => {
        if (pattern.test(content)) {
          scores[categoryName] += 3;
        }
      });

      // Domain matching
      category.domains.forEach(domain => {
        if (fromEmail.includes(domain.toLowerCase())) {
          scores[categoryName] += 4;
        }
      });
    });

    // Apply additional heuristics
    this.applyAdditionalHeuristics(email, scores);

    // Find the category with the highest score
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      return { category: 'sem_categoria', confidence: 0, scores };
    }

    const bestCategory = Object.keys(scores).find(key => scores[key] === maxScore);
    const confidence = Math.min(maxScore / 10, 1);

    this.logger.info(`Email "${subject}" categorized as "${bestCategory}" with confidence ${confidence.toFixed(2)}`);
    
    return {
      category: bestCategory || 'sem_categoria',
      confidence,
      scores
    };
  }

  private applyAdditionalHeuristics(email: EmailData, scores: Record<string, number>): void {
    const { subject, from, body } = email;
    const content = `${subject} ${body}`.toLowerCase();

    // Reclamação indicators
    const complainIndicators = [
      'não funciona',
      'com problema',
      'está quebrado',
      'não está funcionando',
      'péssimo atendimento',
      'muito ruim'
    ];
    
    complainIndicators.forEach(indicator => {
      if (content.includes(indicator)) {
        scores.reclamacao += 3;
      }
    });

    // Orçamento indicators
    if (content.match(/r\$[\s]*\d+/) || 
        content.includes('quanto custa') ||
        content.includes('valor do produto')) {
      scores.orcamento += 3;
    }

    // Informações sobre produto
    if (content.includes('especificações técnicas') || 
        content.includes('ficha técnica') ||
        content.includes('como funciona') ||
        content.includes('mais detalhes')) {
      scores.informacoes_produto += 3;
    }

    // Vendas indicators
    if (content.includes('gostaria de comprar') || 
        content.includes('fazer pedido') ||
        content.includes('está disponível')) {
      scores.vendas += 3;
    }

    // Suporte indicators
    if (content.includes('preciso de ajuda') || 
        content.includes('como usar') ||
        content.includes('não sei como')) {
      scores.suporte += 3;
    }
  }

  async categorizeEmails(emails: EmailData[]): Promise<CategorizationResult[]> {
    this.logger.info(`Starting categorization of ${emails.length} emails`);
    
    const results = emails.map(email => ({
      id: email.id,
      email,
      ...this.categorizeEmail(email)
    }));

    // Log categorization summary
    const categorySummary = results.reduce((acc, result) => {
      acc[result.category] = (acc[result.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.logger.info('Categorization summary:', categorySummary);
    
    return results;
  }

  getCategoryLabel(category: string): string {
    const labelMap: Record<string, string> = {
      reclamacao: 'Reclamação',
      orcamento: 'Orçamento',
      informacoes_produto: 'Informações sobre Produto',
      suporte: 'Suporte',
      vendas: 'Vendas',
      sem_categoria: 'Sem Categoria'
    };

    return labelMap[category] || 'Sem Categoria';
  }

  updateCategories(newCategories: Partial<Categories>): void {
    this.categories = { ...this.categories, ...newCategories } as Categories;
    this.logger.info('Categories updated');
  }

  addCategory(name: string, definition: CategoryDefinition): void {
    this.categories[name] = definition;
    this.logger.info(`Added new category: ${name}`);
  }

  getCategories(): Categories {
    return this.categories;
  }
}