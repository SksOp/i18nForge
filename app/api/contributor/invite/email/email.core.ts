import * as nodemailer from 'nodemailer';

import { emailConfig } from './email.config';

export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailConfig.email.auth.user,
        pass: emailConfig.email.auth.pass,
      },
      connectionTimeout: emailConfig.email.connectionTimeout,
      tls: {
        rejectUnauthorized: emailConfig.email.tls.rejectUnauthorized,
      },
    });
  }
  public async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: `i18nForge  ${emailConfig.email.user}`,
      to,
      subject,
      html,
    };
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(
        mailOptions,
        (error: Error | null, info: nodemailer.SentMessageInfo) => {
          console.log(`Sent email to ${to} with id ${info?.messageId}`);
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        },
      );
    });
  }
}
