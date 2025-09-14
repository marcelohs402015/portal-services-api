import { EmailData, Categories, CategorizationResult, CategoryDefinition } from '../types/email';
export declare class CategorizerService {
    private categories;
    private logger;
    constructor();
    categorizeEmail(email: EmailData): Omit<CategorizationResult, 'id' | 'email'>;
    private applyAdditionalHeuristics;
    categorizeEmails(emails: EmailData[]): Promise<CategorizationResult[]>;
    getCategoryLabel(category: string): string;
    updateCategories(newCategories: Partial<Categories>): void;
    addCategory(name: string, definition: CategoryDefinition): void;
    getCategories(): Categories;
}
//# sourceMappingURL=CategorizerService.d.ts.map