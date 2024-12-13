import nodemailer, { Transporter } from 'nodemailer';
import {
  GITHUB_TAG_NAME,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SERVICE,
  SMTP_TO,
  SMTP_USER
} from '../../constants/env.js';

export class EmailService {
  private transporter: Transporter;

   constructor() {
    this.transporter = nodemailer.createTransport({
      service: SMTP_SERVICE,
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: +SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  async sendEmail(subject: string, text: string) {
    try {
      const info = await this.transporter.sendMail({
        from: SMTP_FROM,
        to: SMTP_TO,
        text,
        subject
      });
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendUploadReport(uploadResult: string[], gitHubRepoName: string) {
    try {
      const finalText = `Successfully replaced the following files:\n${uploadResult.join('\n')}`;

      const info = await this.transporter.sendMail({
        from: SMTP_FROM,
        to: SMTP_TO,
        text: finalText,
        subject: `Repo name: ${gitHubRepoName}. Tag Name: ${GITHUB_TAG_NAME}`
      });
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
