import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

class FineTuneService {
  async createFineTuneJob(trainingData: any[]) {
    if (!openai) throw new Error('OpenAI API key тохируулаагүй');

    // 1. Training file upload
    const file = await openai.files.create({
      file: new File(
        [JSON.stringify(trainingData)],
        'training.jsonl'
      ),
      purpose: 'fine-tune',
    });

    // 2. Fine-tune job
    const job = await openai.fineTuning.jobs.create({
      training_file: file.id,
      model: 'gpt-4o-mini-2024-07-18',
    });

    logger.info(`✅ Fine-tune job: ${job.id}`);
    return job;
  }

  async checkJobStatus(jobId: string) {
    if (!openai) throw new Error('OpenAI API key тохируулаагүй');
    return openai.fineTuning.jobs.retrieve(jobId);
  }
}

export const fineTuneService = new FineTuneService();