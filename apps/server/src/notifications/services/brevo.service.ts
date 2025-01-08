import { SendSmtpEmail, TransactionalEmailsApi } from '@getbrevo/brevo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config';

@Injectable()
export class BrevoService {
  private apiInstance: any;

  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    this.apiInstance = new TransactionalEmailsApi();
    const apiKey = this.apiInstance.authentications['apiKey'];
    apiKey.apiKey = this.configService.get('BREVO_API_KEY');
  }

  async sendConfirmation(toEmail: string, token: string): Promise<void> {
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.templateId = 1;
    sendSmtpEmail.params = {
      baseUrl: this.configService.get('APP_URL'),
      token,
    };
    sendSmtpEmail.to = [{ email: toEmail }];

    await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }

  async sendResetPassword(toEmail: string, token: string): Promise<void> {
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.templateId = 3;
    sendSmtpEmail.params = {
      baseUrl: this.configService.get('APP_URL'),
      token,
    };
    sendSmtpEmail.to = [{ email: toEmail }];

    await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }

  async sendNftLiquidationAlert(
    toEmail: string,
    foreclosureWalletAddress: string,
    nftCollectionName: string,
    nftTokenId: string,
  ) {
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.templateId = 9;
    sendSmtpEmail.params = {
      foreclosureWalletAddress,
      nftCollectionName,
      nftTokenId,
    };
    sendSmtpEmail.to = [{ email: toEmail }];

    await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}
