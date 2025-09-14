import { google } from 'googleapis';
import fs from 'fs/promises';
import { createLogger } from '../shared/logger';
export class GmailService {
    constructor() {
        this.gmail = null;
        this.auth = null;
        this.logger = createLogger('GmailService');
    }
    async authenticate() {
        try {
            const credentialsData = await fs.readFile('config/credentials.json', 'utf8');
            const credentials = JSON.parse(credentialsData);
            const { client_secret, client_id, redirect_uris } = credentials.web;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            try {
                const tokenData = await fs.readFile('config/token.json', 'utf8');
                const token = JSON.parse(tokenData);
                oAuth2Client.setCredentials(token);
                oAuth2Client.on('tokens', async (tokens) => {
                    if (tokens.refresh_token) {
                        await fs.writeFile('config/token.json', JSON.stringify(tokens));
                    }
                });
            }
            catch (error) {
                this.logger.warn('Token file not found, please run setup first');
                throw new Error('Authentication required. Run npm run setup first.');
            }
            this.auth = oAuth2Client;
            this.gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
            this.logger.info('Gmail API authenticated successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Authentication failed:', error.message);
            throw error;
        }
    }
    async getEmails(query = '', maxResults = 50) {
        if (!this.gmail) {
            throw new Error('Gmail API not authenticated');
        }
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: maxResults,
            });
            if (!response.data.messages) {
                return [];
            }
            const emails = await Promise.all(response.data.messages.map(async (message) => {
                if (!message.id)
                    return null;
                const email = await this.gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'full',
                });
                const headers = email.data.payload?.headers || [];
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const from = headers.find(h => h.name === 'From')?.value || '';
                const date = headers.find(h => h.name === 'Date')?.value || '';
                let body = '';
                if (email.data.payload?.body?.data) {
                    body = Buffer.from(email.data.payload.body.data, 'base64').toString();
                }
                else if (email.data.payload?.parts) {
                    for (const part of email.data.payload.parts) {
                        if (part.mimeType === 'text/plain' && part.body?.data) {
                            body = Buffer.from(part.body.data, 'base64').toString();
                            break;
                        }
                    }
                }
                return {
                    id: parseInt(message.id || '0'),
                    gmailId: message.id || '',
                    subject,
                    from,
                    date,
                    body: body.substring(0, 1000),
                    snippet: email.data.snippet || '',
                    threadId: email.data.threadId || undefined,
                    category: '',
                    confidence: 0,
                    processed: false,
                    responded: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }));
            const validEmails = emails.filter(email => email !== null);
            this.logger.info(`Retrieved ${validEmails.length} emails`);
            return validEmails;
        }
        catch (error) {
            this.logger.error('Failed to get emails:', error.message);
            throw error;
        }
    }
    async addLabel(messageId, labelName) {
        if (!this.gmail) {
            throw new Error('Gmail API not authenticated');
        }
        try {
            const labels = await this.gmail.users.labels.list({ userId: 'me' });
            let labelId = labels.data.labels?.find(label => label.name === labelName)?.id;
            if (!labelId) {
                const newLabel = await this.gmail.users.labels.create({
                    userId: 'me',
                    requestBody: {
                        name: labelName,
                        labelListVisibility: 'labelShow',
                        messageListVisibility: 'show',
                    },
                });
                labelId = newLabel.data.id;
                this.logger.info(`Created new label: ${labelName}`);
            }
            if (labelId) {
                await this.gmail.users.messages.modify({
                    userId: 'me',
                    id: messageId,
                    requestBody: {
                        addLabelIds: [labelId],
                    },
                });
                this.logger.info(`Added label "${labelName}" to message ${messageId}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to add label: ${error.message}`);
            throw error;
        }
    }
    async sendReply(messageId, replyBody, subject = '') {
        if (!this.gmail) {
            throw new Error('Gmail API not authenticated');
        }
        try {
            // Get original message to get thread ID and reply details
            const originalMessage = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });
            const headers = originalMessage.data.payload?.headers || [];
            const originalFrom = headers.find(h => h.name === 'From')?.value || '';
            const originalSubject = headers.find(h => h.name === 'Subject')?.value || '';
            const threadId = originalMessage.data.threadId;
            // Construct reply
            const replySubject = subject || `Re: ${originalSubject}`;
            const rawMessage = [
                `To: ${originalFrom}`,
                `Subject: ${replySubject}`,
                `In-Reply-To: ${messageId}`,
                `References: ${messageId}`,
                '',
                replyBody
            ].join('\n');
            const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                    threadId: threadId,
                },
            });
            this.logger.info(`Reply sent for message ${messageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send reply: ${error.message}`);
            throw error;
        }
    }
}
//# sourceMappingURL=GmailService.js.map