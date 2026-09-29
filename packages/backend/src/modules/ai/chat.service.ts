import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

const pinecone = env.PINECONE_API_KEY
  ? new Pinecone({ apiKey: env.PINECONE_API_KEY })
  : null;

class ChatService {
  async getEmbedding(text: string): Promise<number[]> {
    if (!openai) {
      throw new Error('OpenAI API key тохируулаагүй');
    }
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  async searchContext(
    organizationId: string,
    question: string
  ): Promise<string> {
    if (!pinecone) return '';
    try {
      const embedding = await this.getEmbedding(question);
      const index = pinecone.index('taskhub');
      const results = await index.namespace(organizationId).query({
        vector: embedding,
        topK: 5,
        includeMetadata: true,
      });
      return results.matches
        .map((m) => (m.metadata?.text as string) || '')
        .filter(Boolean)
        .join('\n\n');
    } catch (error) {
      logger.error('Pinecone search error:', error);
      return '';
    }
  }

  async chat(
    organizationId: string,
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []
  ) {
    if (!openai) {
      return {
        answer: 'AI үйлчилгээ одоогоор боломжгүй байна.',
        needsEscalation: true,
        context: '',
      };
    }

    const context = await this.searchContext(organizationId, userMessage);

    const systemPrompt = `Та TaskHub Pro-ийн AI туслах.
Дараах мэдээллийг ашиглан хариулт өг:
${context}

Хэрэв асуулт нарийн бол (үнэ, захиалга, гэрээ) "Мэргэжилтэн тантай холбогдох болно" гэж хэлж, escalation хийнэ.
Монгол хэлээр эелдэг хариул.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0].message.content || '';

    const needsEscalation = /мэргэжилтэн|холбогдох|захиалга|гэрээ/i.test(
      answer
    );

    return { answer, needsEscalation, context };
  }

  async addKnowledge(organizationId: string, text: string) {
    if (!pinecone) {
      logger.warn('Pinecone тохируулаагүй, knowledge нэмэхгүй');
      return;
    }
    try {
      const embedding = await this.getEmbedding(text);
      const index = pinecone.index('taskhub');
      await index.namespace(organizationId).upsert({
        records: [
          {
            id: `${Date.now()}-${Math.random()}`,
            values: embedding,
            metadata: { text },
          },
        ],
      });
    } catch (error) {
      logger.error('Pinecone upsert error:', error);
    }
  }
}

export const chatService = new ChatService();