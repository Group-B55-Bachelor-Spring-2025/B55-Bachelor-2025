import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PRICE_COLLECTOR_QUEUE } from './jobs/price-collector/price-collector.queue';
import { QueueInitializerService } from './queue-initializer.service';
import { TOKEN_CLEANUP_QUEUE } from './jobs/token-cleanup/token-cleanup.queue';
import { PEAK_HOUR_ADJUSTMENT_QUEUE } from './jobs/peak-hour-adjustment/peak-hour-adjustment.queue';
import { PeakHourAdjustmentQueue } from './jobs/peak-hour-adjustment/peak-hour-adjustment.queue';
import { DEVICE_UPDATE_QUEUE } from './jobs/device-update/device-update.queue';
import { DeviceUpdateQueue } from './jobs/device-update/device-update.queue';

interface DeviceSyncJob {
  deviceId?: string;
  userId?: string;
  action?: string;
}

@Controller('queue')
export class QueueController {
  constructor(
    private readonly queueInitializer: QueueInitializerService,
    @InjectQueue(PRICE_COLLECTOR_QUEUE) private priceQueue: Queue,
    @InjectQueue(TOKEN_CLEANUP_QUEUE) private tokenQueue: Queue,
    @InjectQueue(PEAK_HOUR_ADJUSTMENT_QUEUE) private peakHourQueue: Queue,
    @InjectQueue(DEVICE_UPDATE_QUEUE) private deviceQueue: Queue,

    private readonly peakHourAdjustmentQueue: PeakHourAdjustmentQueue,
    private readonly deviceUpdateQueue: DeviceUpdateQueue,
  ) {}

  // Device Sync Endpoints
  @Post('device-sync')
  async addSyncJob(@Body() job: DeviceSyncJob) {
    const result = await this.deviceUpdateQueue.triggerImmediateUpdate();
    return {
      jobId: result?.id || 'unknown',
      status: 'added',
    };
  }

  @Post('device-sync/bulk')
  async addBulkSyncJobs(@Body() jobs: DeviceSyncJob[]) {
    const results: { id: string }[] = [];
    for (const job of jobs) {
      const result = await this.deviceUpdateQueue.triggerImmediateUpdate();
      if (result && result.id) {
        results.push({ id: result.id });
      }
    }

    return {
      jobCount: results.length,
      jobIds: results.map((job) => job.id),
      status: 'added',
    };
  }

  @Get('device-sync/jobs')
  async getDeviceJobs() {
    const jobs = await this.deviceQueue.getJobs([
      'active',
      'waiting',
      'completed',
      'failed',
    ]);

    const jobDetails = await Promise.all(
      jobs.map(async (job) => {
        return {
          id: job.id,
          data: job.data,
          state: await job.getState(),
          progress: job.progress,
          timestamp: job.timestamp,
        };
      }),
    );

    return jobDetails;
  }

  @Get('device-sync/jobs/:id')
  async getDeviceJob(@Param('id') id: string) {
    const job = await this.deviceQueue.getJob(id);
    if (!job) {
      return { error: 'Job not found' };
    }

    const state = await job.getState();

    return {
      id: job.id,
      data: job.data,
      state,
      progress: job.progress,
      timestamp: job.timestamp,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  // Peak Hour Adjustment Endpoint
  @Get('peak-hour-adjustment/trigger')
  async triggerImmediatePeakHourAdjustment() {
    const job = await this.peakHourAdjustmentQueue.addImmediateAdjustmentJob();
    return {
      message: 'Peak hour temperature adjustment job has been queued',
      jobId: job.id,
    };
  }

  @Get('price-collector/trigger')
  async triggerImmediatePriceCollection() {
    await this.queueInitializer.triggerImmediatePriceFetch();
    return { message: 'Price fetch job has been queued' };
  }

  @Get('price-collector/jobs')
  async getPriceJobs() {
    const jobs = await this.priceQueue.getJobs([
      'active',
      'waiting',
      'completed',
      'failed',
    ]);

    const jobDetails = await Promise.all(
      jobs.map(async (job) => {
        return {
          id: job.id,
          data: job.data,
          state: await job.getState(),
          progress: job.progress,
          timestamp: job.timestamp,
        };
      }),
    );

    return jobDetails;
  }

  @Get('price-collector/jobs/:id')
  async getPriceJob(@Param('id') id: string) {
    const job = await this.priceQueue.getJob(id);
    if (!job) {
      return { error: 'Job not found' };
    }

    const state = await job.getState();

    return {
      id: job.id,
      data: job.data,
      state,
      progress: job.progress,
      timestamp: job.timestamp,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  // General Queue Management
  @Get('stats')
  async getQueueStats() {
    const deviceStats = await this.deviceQueue.getJobCounts();
    const priceStats = await this.priceQueue.getJobCounts();
    const tokenStats = await this.tokenQueue.getJobCounts();
    const peakHourStats = await this.peakHourQueue.getJobCounts();

    return {
      deviceSync: deviceStats,
      priceCollector: priceStats,
      tokenCleanup: tokenStats,
      peakHourAdjustment: peakHourStats,
    };
  }
}
