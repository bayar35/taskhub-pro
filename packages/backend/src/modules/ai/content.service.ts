import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

class ContentService {
  async generatePoster(business: any, theme: string): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI API key тохируулаагүй');
    }

    const prompt = `Create a professional ${theme} poster for a ${business.type} business named "${business.name}". 
Style: modern, clean, social media ready. 
Include space for text. 
Colors: ${business.primaryColor || 'blue'}.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const url = response.data?.[0]?.url;
    if (!url) throw new Error('Зураг үүсгэхэд алдаа гарлаа');
    return url;
  }

  async generateCaption(business: any, platform: string): Promise<string> {
    if (!openai) {
      return 'AI үйлчилгээ одоогоор боломжгүй байна.';
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Та ${business.type} бизнест зориулсан ${platform} контент бичигч. Монгол хэлээр бич.`,
        },
        {
          role: 'user',
          content: `${business.name} бизнест зориулсан ${platform} пост бич.
Үйлчилгээ: ${(business.services || []).join(', ')}
Хаяг: ${business.address || ''}
Утас: ${business.phone || ''}
Emoji ашигла. 150 үгээс бага.`,
        },
      ],
    });

    return response.choices[0].message.content || '';
  }

  async generateWeeklyContent(organizationId: string) {
    logger.info(`Content generation for org: ${organizationId}`);
    // Business model ашиглах...
  }
}

export const contentService = new ContentService();