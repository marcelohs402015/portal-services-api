export interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  snippet: string;
  threadId?: string;
}

export interface CategoryDefinition {
  keywords: string[];
  patterns: RegExp[];
  domains: string[];
}

export interface Categories {
  [key: string]: CategoryDefinition;
}

export interface CategorizationResult {
  id: string;
  email: EmailData;
  category: string;
  confidence: number;
  scores: Record<string, number>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category?: string;
  variables?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategorizedEmail {
  id: string;
  gmailId: string;
  subject: string;
  from: string;
  date: Date;
  body: string;
  snippet: string;
  category: string;
  confidence: number;
  processed: boolean;
  responded: boolean;
  responseTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}