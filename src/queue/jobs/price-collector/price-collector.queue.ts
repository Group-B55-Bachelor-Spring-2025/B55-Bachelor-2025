import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export const PRICE_COLLECTOR_QUEUE = 'price-collector-queue';

@Injectable()
export class PriceCollectorQueue {
  constructor(
    @InjectQueue(PRICE_COLLECTOR_QUEUE) private priceCollectorQueue: Queue,
  ) {}

  async scheduleDailyPriceCollection() {
    // Schedule a job to run at 13:00 every day
    const now = new Date();
    const nextRun = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      13,
      0,
      0,
      0,
    );

    // If it's already past 13:00 today, schedule for tomorrow
    if (now.getHours() >= 13) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    // Calculate delay in milliseconds
    const delay = nextRun.getTime() - now.getTime();

    return await this.priceCollectorQueue.add(
      'collect-prices',
      {},
      {
        delay,
        repeat: {
          pattern: '0 15 * * *', // At 15:00 every day
        },
      },
    );
  }

  async addImmediateJob() {
    return await this.priceCollectorQueue.add('collect-prices', {});
  }
}
