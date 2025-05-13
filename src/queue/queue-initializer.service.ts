import { Injectable, OnModuleInit } from '@nestjs/common';
import { PriceCollectorQueue } from './jobs/price-collector/price-collector.queue';
import { TokenCleanupQueue } from './jobs/token-cleanup/token-cleanup.queue';
import { DeviceUpdateQueue } from './jobs/device-update/device-update.queue';

@Injectable()
export class QueueInitializerService implements OnModuleInit {
  constructor(
    private readonly priceCollectorQueue: PriceCollectorQueue,
    private readonly tokenCleanupQueue: TokenCleanupQueue,
    private readonly deviceUpdateQueue: DeviceUpdateQueue,
  ) {}

  /**
   * Initialize all queue jobs when the application starts
   */
  async onModuleInit() {
    await this.initializeTokenCleanupQueue();
    await this.initializePriceCollectorQueue();
    await this.initializeDeviceUpdateQueue();

    console.log('🚀 All queue jobs have been scheduled');
  }

  // schedule token cleanup job
  private async initializeTokenCleanupQueue(): Promise<void> {
    await this.tokenCleanupQueue.scheduleDailyCleanup();
    console.log('🧹 Scheduled daily token cleanup job');
  }

  // Schedule the daily price collection job
  private async initializePriceCollectorQueue(): Promise<void> {
    await this.priceCollectorQueue.scheduleDailyPriceCollection();
    console.log('⏰ Scheduled daily price collection job');
  }

  // Schedule the device update job to run every 5 minutes
  private async initializeDeviceUpdateQueue(): Promise<void> {
    await this.deviceUpdateQueue.scheduleDeviceUpdates();
    console.log('🔄 Scheduled device update job (runs every 5 minutes)');
  }

  // for testing, manually trigger an immediate price fetch
  async triggerImmediatePriceFetch(): Promise<void> {
    await this.priceCollectorQueue.addImmediateJob();
    console.log('Immediate price fetch job added to queue');
  }

  // for testing, manually trigger an immediate device update
  async triggerImmediateDeviceUpdate(): Promise<void> {
    await this.deviceUpdateQueue.triggerImmediateUpdate();
    console.log('Immediate device update job added to queue');
  }
}
