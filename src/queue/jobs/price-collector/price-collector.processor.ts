import { Processor, OnQueueEvent, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PriceCollectorService } from '../../../price-collector/nordpool-service';
import { PRICE_COLLECTOR_QUEUE } from './price-collector.queue';

@Injectable()
@Processor(PRICE_COLLECTOR_QUEUE)
export class PriceCollectorProcessor extends WorkerHost {
  private readonly logger = new Logger(PriceCollectorProcessor.name);

  constructor(private readonly priceCollectorService: PriceCollectorService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'collect-prices') {
      return;
    }

    this.logger.log(`Starting price collection job #${job.id}`);
    return await this.priceCollectorService.fetchAndStoreAllZones();
  }

  @OnQueueEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnQueueEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
