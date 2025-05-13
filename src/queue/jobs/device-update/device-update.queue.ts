import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export const DEVICE_UPDATE_QUEUE = 'device-update-queue';

@Injectable()
export class DeviceUpdateQueue {
  constructor(
    @InjectQueue(DEVICE_UPDATE_QUEUE) private deviceUpdateQueue: Queue,
  ) {}

  async scheduleDeviceUpdates() {
    return await this.deviceUpdateQueue.add(
      'update-all-devices',
      {},
      {
        repeat: {
          pattern: '*/5 * * * *', // Every 5 minutes
        },
        removeOnComplete: true,
        removeOnFail: 100, // Keep the last 100 failed jobs for debugging
      },
    );
  }

  async triggerImmediateUpdate() {
    return await this.deviceUpdateQueue.add('update-all-devices', {});
  }
}
