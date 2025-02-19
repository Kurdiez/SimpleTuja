import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '~/config';

@Injectable()
export class GeminiAiService {
  private readonly logger: Logger = new Logger(GeminiAiService.name);
  private readonly model: ChatGoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get('GEMINI_AI_API_KEY'),
      modelName: 'gemini-2.0-flash',
    });
  }

  async generateRawResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.invoke(prompt);
      const responseText = result.content.toString();
      this.logger.log(`Raw Gemini Response: ${responseText}`);
      return responseText;
    } catch (error) {
      this.logger.error('Error generating raw response from Gemini:', error);
      throw error;
    }
  }
}
