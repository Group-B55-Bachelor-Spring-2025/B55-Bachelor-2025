import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

export const PEAK_HOUR_ADJUSTMENT_QUEUE = 'peak-hour-adjustment';

@Injectable()
export class PeakHourAdjustmentQueue {
  private readonly logger = new Logger(PeakHourAdjustmentQueue.name);

  constructor(
    @InjectQueue(PEAK_HOUR_ADJUSTMENT_QUEUE)
    private readonly peakHourAdjustmentQueue: Queue,
  ) {}

  //Schedule peak hour temperature adjustments to run every hour
  async scheduleHourlyAdjustments() {
    const now = new Date();
    const nextHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours() + 1,
      0,
      0,
      0,
    );

    // Calculate delay in milliseconds
    const delay = nextHour.getTime() - now.getTime();

    return await this.peakHourAdjustmentQueue.add(
      'adjust-temperatures',
      {
        timestamp: new Date().toISOString(),
      },
      {
        delay,
        repeat: {
          pattern: '0 * * * *', // At minute 0 of every hour
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async addImmediateAdjustmentJob() {
    return await this.peakHourAdjustmentQueue.add('adjust-temperatures', {
      timestamp: new Date().toISOString(),
    });
  }
}
