import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '~/config';

@Injectable()
export class GeminiAiService {
  private readonly model: ChatGoogleGenerativeAI;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get('GEMINI_AI_API_KEY'),
      modelName: 'gemini-2.0-flash',
    });
    this.logger = new Logger(GeminiAiService.name);
  }

  async generateSignal(prompt: string, schema: any): Promise<any> {
    const response = await this.model.invoke(prompt);
    const responseText = response.content.toString();
    const cleanedResponse = this.cleanJsonResponse(responseText);
    return schema.parse(cleanedResponse);
  }

  private cleanJsonResponse(response: string): any {
    // Remove markdown code block if present
    const cleanedString = response
      .replace(/```json\n/, '')
      .replace(/```\n?$/, '')
      .trim();

    try {
      return JSON.parse(cleanedString);
    } catch (error) {
      throw new Error(`Failed to parse Gemini AI response: ${error.message}`);
    }
  }
}
