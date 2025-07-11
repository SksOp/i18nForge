import * as nodemailer from 'nodemailer';

import { emailConfig } from './email.config';

//https://beta.i18nforge.com/colab/f3956d7e-68cd-4ee0-95f7-340496ca4082?token=bkv6vfgi3hadrq25x477cc
export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: emailConfig.email.host,
      port: emailConfig.email.port,
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
  public async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const mailOptions = {
      from: `Jenny from i18nForge  <i18nforge@devflex.co.in>`,
      to,
      subject,
      html,
    };
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(
        mailOptions,
        (error: Error | null, info: nodemailer.SentMessageInfo) => {
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
