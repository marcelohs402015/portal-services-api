/**
 * Rate Limiter Middleware
 * Middleware para limitar taxa de requisições e prevenir ataques
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RateLimitOptions {
  windowMs: number;      // Janela de tempo em ms
  max: number;           // Máximo de requisições
  message?: string;      // Mensagem de erro
  skipSuccessfulRequests?: boolean;  // Pular requisições bem-sucedidas
  skipFailedRequests?: boolean;      // Pular requisições com erro
  keyGenerator?: (req: Request) => string; // Função para gerar chave
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpa entradas expiradas a cada minuto
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Cria middleware de rate limiting
   */
  createMiddleware(options: RateLimitOptions) {
    const {
      windowMs = 60000,
      max = 100,
      message = 'Muitas requisições, por favor tente novamente mais tarde.',
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      keyGenerator = (req) => req.ip || 'unknown'
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      const key = keyGenerator(req);
      const now = Date.now();
      
      let requestData = this.requests.get(key);
      
      // Se não existe ou expirou, cria nova entrada
      if (!requestData || requestData.resetTime < now) {
        requestData = {
          count: 0,
          resetTime: now + windowMs
        };
        this.requests.set(key, requestData);
      }

      // Incrementa contador
      requestData.count++;

      // Verifica se excedeu o limite
      if (requestData.count > max) {
        const retryAfter = Math.ceil((requestData.resetTime - now) / 1000);
        
        // Headers de rate limit
        res.setHeader('X-RateLimit-Limit', max.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());
        res.setHeader('Retry-After', retryAfter.toString());

        logger.warn('Rate limit excedido', {
          key,
          requests: requestData.count,
          limit: max,
          path: req.path,
          method: req.method
        });

        res.status(429).json({
          success: false,
          error: message,
          retryAfter,
          code: 'RATE_LIMIT_EXCEEDED'
        });
        return;
      }

      // Headers informativos
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', (max - requestData.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());

      // Se configurado, decrementa contador baseado no resultado
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalSend = res.send;
        res.send = function(data) {
          const statusCode = res.statusCode;
          
          if ((skipSuccessfulRequests && statusCode < 400) ||
              (skipFailedRequests && statusCode >= 400)) {
            requestData!.count--;
          }
          
          return originalSend.call(this, data);
        };
      }

      next();
    };
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    this.requests.forEach((value, key) => {
      if (value.resetTime < now) {
        this.requests.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      logger.debug(`Rate limiter: ${cleaned} entradas limpas`);
    }
  }

  /**
   * Destrói o rate limiter
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

/**
 * Rate limit global - aplica a todas as requisições
 */
export const globalRateLimit = rateLimiter.createMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requisições por IP
  message: 'Muitas requisições do seu IP, por favor tente novamente em 15 minutos.'
});

/**
 * Rate limit estrito - para rotas sensíveis
 */
export const strictRateLimit = rateLimiter.createMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requisições
  message: 'Muitas tentativas, por favor tente novamente mais tarde.',
  skipSuccessfulRequests: true // Só conta requisições com erro
});

/**
 * Rate limit para autenticação
 */
export const authRateLimit = rateLimiter.createMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas de login
  message: 'Muitas tentativas de login, por favor tente novamente em 15 minutos.',
  skipSuccessfulRequests: true
});

/**
 * Rate limit para criação de recursos
 */
export const createRateLimit = rateLimiter.createMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100, // 100 criações por hora
  message: 'Limite de criação de recursos excedido, tente novamente em 1 hora.'
});

/**
 * Rate limit por API key
 */
export const apiKeyRateLimit = rateLimiter.createMiddleware({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requisições por minuto
  keyGenerator: (req) => req.headers['x-api-key'] as string || req.ip || 'unknown',
  message: 'Limite de requisições da API excedido.'
});

export default rateLimiter;
