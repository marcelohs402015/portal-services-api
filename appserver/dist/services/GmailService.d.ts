import { EmailData } from '../shared/types';
export declare class GmailService {
    private gmail;
    private auth;
    private logger;
    constructor();
    authenticate(): Promise<boolean>;
    getEmails(query?: string, maxResults?: number): Promise<EmailData[]>;
    addLabel(messageId: string, labelName: string): Promise<void>;
    sendReply(messageId: string, replyBody: string, subject?: string): Promise<void>;
}
//# sourceMappingURL=GmailService.d.ts.map