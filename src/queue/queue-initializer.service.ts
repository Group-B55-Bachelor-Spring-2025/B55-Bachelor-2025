import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PriceCollectorQueue } from './jobs/price-collector/price-collector.queue';
import { TokenCleanupQueue } from './jobs/token-cleanup/token-cleanup.queue';
import { DeviceUpdateQueue } from './jobs/device-update/device-update.queue';
import { PeakHourAdjustmentQueue } from './jobs/peak-hour-adjustment/peak-hour-adjustment.queue';

@Injectable()
export class QueueInitializerService implements OnModuleInit {
  private readonly logger = new Logger(QueueInitializerService.name);

  constructor(
    private readonly priceCollectorQueue: PriceCollectorQueue,
    private readonly tokenCleanupQueue: TokenCleanupQueue,
    private readonly deviceUpdateQueue: DeviceUpdateQueue,
    private readonly peakHourAdjustmentQueue: PeakHourAdjustmentQueue,
  ) {}

  /**
   * Initialize all queue jobs when the application starts
   */
  async onModuleInit() {
    this.logger.log('Initializing background job queues...');

    try {
      await this.initializeTokenCleanupQueue();
      await this.initializePriceCollectorQueue();
      await this.initializeDeviceUpdateQueue();
      await this.initializePeakHourAdjustmentQueue();

      this.logger.log('🚀 All queue jobs have been successfully scheduled');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to initialize job queues: ${errorMsg}`,
        errorStack,
      );
      throw error; // Re-throw to allow NestJS to handle the error
    }
  }

  /**
   * Schedule token cleanup job to run daily
   */
  private async initializeTokenCleanupQueue(): Promise<void> {
    try {
      await this.tokenCleanupQueue.scheduleDailyCleanup();
      this.logger.log('🧹 Scheduled daily token cleanup job');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to schedule token cleanup job: ${errorMsg}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Schedule the daily price collection job
   */
  private async initializePriceCollectorQueue(): Promise<void> {
    try {
      await this.priceCollectorQueue.scheduleDailyPriceCollection();
      this.logger.log('⏰ Scheduled daily price collection job');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to schedule price collection job: ${errorMsg}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Schedule the device update job to run every 5 minutes
   */
  private async initializeDeviceUpdateQueue(): Promise<void> {
    try {
      await this.deviceUpdateQueue.scheduleDeviceUpdates();
      this.logger.log('🔄 Scheduled device update job (runs every 5 minutes)');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to schedule device update job: ${errorMsg}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Schedule the peak hour temperature adjustment jobs
   */
  private async initializePeakHourAdjustmentQueue(): Promise<void> {
    try {
      await this.peakHourAdjustmentQueue.scheduleHourlyAdjustments();
      this.logger.log(
        '🌡️ Scheduled peak hour temperature adjustment jobs (hourly) and cleanup (daily)',
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to schedule temperature adjustment jobs: ${errorMsg}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Manually trigger an immediate price fetch (for testing/admin purposes)
   */
  async triggerImmediatePriceFetch(): Promise<void> {
    try {
      await this.priceCollectorQueue.addImmediateJob();
      this.logger.log('Immediate price fetch job added to queue');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to add immediate price fetch job: ${errorMsg}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Manually trigger an immediate device update (for testing/admin purposes)
   */
  async triggerImmediateDeviceUpdate(): Promise<void> {
    try {
      await this.deviceUpdateQueue.triggerImmediateUpdate();
      this.logger.log('Immediate device update job added to queue');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to add immediate device update job: ${errorMsg}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Manually trigger an immediate temperature adjustment (for testing/admin purposes)
   */
  async triggerImmediateTemperatureAdjustment(): Promise<void> {
    try {
      await this.peakHourAdjustmentQueue.addImmediateAdjustmentJob();
      this.logger.log('Immediate temperature adjustment job added to queue');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to add immediate temperature adjustment job: ${errorMsg}`,
        errorStack,
      );
      throw error;
    }
  }
}
