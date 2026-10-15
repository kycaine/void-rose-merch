import { D1Database } from '@cloudflare/workers-types';
import { emailLogs } from '../../db/schema.js';
import { drizzle } from 'drizzle-orm/d1';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  orderId?: string;
  template: string;
}

export class EmailService {
  private apiKey?: string;
  private from: string;
  private db: D1Database;

  constructor(env: { RESEND_API_KEY?: string; RESEND_FROM?: string; DB: D1Database }) {
    this.apiKey = env.RESEND_API_KEY;
    this.from = env.RESEND_FROM || 'VOID/ROSE Merch <orders@voidrose.reternia.com>';
    this.db = env.DB;
  }

  async send(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    const logId = `em_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orm = drizzle(this.db);

    // If no Resend API key is provided, use Dev Mode logging
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey.startsWith('re_dummy')) {
      console.log(`\n======================================================`);
      console.log(`📨 [DEV EMAIL SIMULATED]`);
      console.log(`To: ${options.to}`);
      console.log(`From: ${this.from}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Template: ${options.template}`);
      console.log(`Order ID: ${options.orderId || '-'}`);
      console.log(`======================================================\n`);

      try {
        await orm.insert(emailLogs).values({
          id: logId,
          orderId: options.orderId ?? null,
          recipient: options.to,
          subject: options.subject,
          template: options.template,
          status: 'logged',
          errorMessage: null,
          createdAt: new Date().toISOString()
        });
      } catch (err: unknown) {
        console.error('Failed to log simulated email to DB:', err);
      }

      return { success: true, id: logId };
    }

    // Live Resend API call via fetch (100% Cloudflare Workers compatible)
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.from,
          to: [options.to],
          subject: options.subject,
          html: options.html
        })
      });

      const body = (await res.json()) as { id?: string; message?: string; name?: string };

      if (!res.ok) {
        const errorMsg = body.message || `Resend HTTP error ${res.status}`;
        console.error(`[EmailService] Resend send failed: ${errorMsg}`);

        await orm.insert(emailLogs).values({
          id: logId,
          orderId: options.orderId ?? null,
          recipient: options.to,
          subject: options.subject,
          template: options.template,
          status: 'failed',
          errorMessage: errorMsg,
          createdAt: new Date().toISOString()
        });

        return { success: false, error: errorMsg };
      }

      await orm.insert(emailLogs).values({
        id: logId,
        orderId: options.orderId ?? null,
        recipient: options.to,
        subject: options.subject,
        template: options.template,
        status: 'sent',
        errorMessage: null,
        createdAt: new Date().toISOString()
      });

      return { success: true, id: body.id || logId };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[EmailService] Unexpected error sending email:', errorMsg);

      try {
        await orm.insert(emailLogs).values({
          id: logId,
          orderId: options.orderId ?? null,
          recipient: options.to,
          subject: options.subject,
          template: options.template,
          status: 'failed',
          errorMessage: errorMsg,
          createdAt: new Date().toISOString()
        });
      } catch {
        // fail silently
      }

      return { success: false, error: errorMsg };
    }
  }
}
