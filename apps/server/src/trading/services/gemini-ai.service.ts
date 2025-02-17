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

  async generateSignal(prompt: string, schema: any): Promise<any> {
    const structuredPrompt = `${prompt}

IMPORTANT: Your response must be valid JSON matching this exact structure:
For trades (when action is "long" or "short"):
{
  "tradeDecision": {
    "action": "long" or "short",
    "stopLoss": "numeric_price",
    "takeProfit": "numeric_price"
  },
  "stepAnalysis": {
    "1": "analysis_text",
    ...
    "8": "analysis_text"
  }
}

For no-trade:
{
  "tradeDecision": {
    "action": "none"
  },
  "stepAnalysis": {
    "1": "analysis_text",
    ...
    "8": "analysis_text"
  }
}`;

    const response = await this.model.invoke(structuredPrompt);
    const responseText = response.content.toString();
    const cleanedResponse = this.cleanJsonResponse(responseText);

    this.logger.log(
      'Received Gemini signal result:',
      JSON.stringify(cleanedResponse, null, 2),
    );

    return schema.parse(cleanedResponse);
  }

  private cleanJsonResponse(response: string): any {
    // Remove markdown code block if present
    const cleanedString = response
      .replace(/```json\n/, '')
      .replace(/```\n?$/, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanedString);
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse Gemini AI response: ${error.message}`);
    }
  }
}
