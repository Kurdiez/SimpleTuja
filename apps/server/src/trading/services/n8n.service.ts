import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '~/config';
import {
  TradeSignalResponse,
  tradeSignalResponseSchema,
} from '../ai-response-schema/generate-signal';
import { N8nSignalResponse, SignalGeneratorContextData } from '../utils/types';

@Injectable()
export class N8NService {
  private readonly webhookBaseUrl: string;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.webhookBaseUrl = this.configService.get('N8N_WEBHOOK_BASE_URL');
    this.webhookSecret = this.configService.get('N8N_WEBHOOK_SECRET');
  }

  private async makeN8NRequest<T, R = any>(url: string, data: T) {
    return axios.post<R>(url, JSON.stringify(data), {
      headers: {
        'stj-secret': this.webhookSecret,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateSignal(
    signalGeneratorContextData: SignalGeneratorContextData,
  ): Promise<TradeSignalResponse> {
    const webhookUrl = `${this.webhookBaseUrl}/${this.configService.get('N8N_TRADING_SIGNAL_WEBHOOK_PATH')}`;
    const response = await this.makeN8NRequest<
      SignalGeneratorContextData,
      N8nSignalResponse
    >(webhookUrl, signalGeneratorContextData);

    const outputData = this.cleanJsonResponse(response.data.output);
    const parsedResponse = tradeSignalResponseSchema.parse(outputData);
    return parsedResponse;
  }

  private cleanJsonResponse(response: string | any): any {
    if (typeof response === 'string') {
      // Remove markdown code block if present, Google Gemini AI agent includes it unnecessarily
      const cleanedString = response
        .replace(/```json\n/, '')
        .replace(/```$/, '')
        .trim();
      return JSON.parse(cleanedString);
    }
    return response;
  }
}
