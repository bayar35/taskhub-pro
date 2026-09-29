import cron from 'node-cron';
import { RecurringTask } from '../../models/RecurringTask.model';
import { Todo } from '../../models/Todo.model';
import { logger } from '../../config/logger';

class RecurringService {
  async createRecurring(data: any) {
    const nextRunAt = this.calculateNextRun(data);
    return RecurringTask.create({ ...data, nextRunAt });
  }

  calculateNextRun(task: any): Date {
    const now = new Date();
    const next = new Date(task.startDate);

    while (next <= now) {
      switch (task.frequency) {
        case 'daily':
          next.setDate(next.getDate() + task.interval);
          break;
        case 'weekly':
          next.setDate(next.getDate() + 7 * task.interval);
          break;
        case 'monthly':
          next.setMonth(next.getMonth() + task.interval);
          break;
        case 'yearly':
          next.setFullYear(next.getFullYear() + task.interval);
          break;
      }
    }

    return next;
  }

  async processRecurringTasks() {
    const now = new Date();
    const dueTasks = await RecurringTask.find({
      active: true,
      nextRunAt: { $lte: now },
    });

    for (const task of dueTasks) {
      try {
        // Todo үүсгэх
        await Todo.create({
          organizationId: task.organizationId,
          userId: task.userId,
          text: task.text,
          category: task.category,
          priority: task.priority,
          completed: false,
        });

        // Дараагийн run тооцох
        task.lastRunAt = new Date();
        task.nextRunAt = this.calculateNextRun(task);

        // Хэрэв endDate хүрсэн бол идэвхгүй болгох
        if (task.endDate && task.nextRunAt > task.endDate) {
          task.active = false;
        }

        await task.save();
        logger.info(`Recurring task executed: ${task._id}`);
      } catch (error) {
        logger.error(`Recurring task failed: ${task._id}`, error);
      }
    }
  }

  // Cron job эхлүүлэх
  startCron() {
    // Өдөр бүр 00:00 цагт ажиллана
    cron.schedule('0 0 * * *', () => {
      logger.info('Processing recurring tasks...');
      this.processRecurringTasks();
    });
  }
}

export const recurringService = new RecurringService();