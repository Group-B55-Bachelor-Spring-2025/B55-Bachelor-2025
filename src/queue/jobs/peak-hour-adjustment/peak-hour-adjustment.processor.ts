import { Processor, OnQueueEvent, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DeviceGroupsService } from '@app/device-management/device-groups/device-groups.service';
import { SmartControlSettingsService } from '@app/smart-control/smart-control-settings/smart-control-settings.service';
import { ProviderCredentialsService } from '@app/provider-management/core/credentials/provider-credentials.service';
import { ProvidersService } from '@app/provider-management/core/providers/providers.service';
import { MillService } from '@app/provider-management/adapters/mill/mill.service';
import { PriceCollectorService } from '../../../price-collector/nordpool-service';
import { PEAK_HOUR_ADJUSTMENT_QUEUE } from './peak-hour-adjustment.queue';
import { DevicesService } from '@app/device-management/devices/devices.service';

@Injectable()
@Processor(PEAK_HOUR_ADJUSTMENT_QUEUE)
export class PeakHourAdjustmentProcessor extends WorkerHost {
  private readonly logger = new Logger(PeakHourAdjustmentProcessor.name);

  constructor(
    private readonly deviceGroupsService: DeviceGroupsService,
    private readonly smartControlSettingsService: SmartControlSettingsService,
    private readonly providerCredentialsService: ProviderCredentialsService,
    private readonly providersService: ProvidersService,
    private readonly millService: MillService,
    private readonly priceCollectorService: PriceCollectorService,
    private readonly devicesService: DevicesService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    if (job.name === 'adjust-temperatures') {
      return this.handlePeakHourAdjustment(job);
    }

    this.logger.warn(`Unknown job name: ${job.name}`);
    return { success: false, reason: `Unknown job name: ${job.name}` };
  }

  async handlePeakHourAdjustment(job: Job) {
    this.logger.debug(
      `Processing peak hour temperature adjustment job ${job.id}`,
    );

    try {
      // 1. Find all device groups with smart control settings enabled
      const allDeviceGroups =
        await this.deviceGroupsService.findAllSmartControlEnabled();

      for (const deviceGroup of allDeviceGroups) {
        const devices = deviceGroup.devices || [];

        if (!devices || devices.length === 0 || !deviceGroup.address) {
          continue;
        }

        // 2. Find the region for this device group using the address
        const address = deviceGroup.address;
        if (!address) {
          this.logger.warn(
            `No region found for device group ${deviceGroup.id}, skipping`,
          );
          continue;
        }

        // 3. Find price data for this zone
        const today = new Date();
        const date = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
        );
        const zonePrice =
          await this.priceCollectorService.getPricesForDateAndZone(
            date,
            address.regionCode,
          );

        if (!zonePrice) {
          this.logger.warn(
            `No price data found for device group ${deviceGroup.id}, skipping`,
          );
          continue;
        }

        const isPeakHour = await this.smartControlSettingsService.isPeakHour(
          deviceGroup.smartControlSettings[0],
          zonePrice.prices,
          new Date(),
        );

        const temperatureOffset =
          deviceGroup.smartControlSettings[0]?.temperatureOffset;

        // 4. Adjust the temperature for each device in the group
        for (const device of deviceGroup.devices) {
          if (
            device.excludeSmartCtrl ||
            !device.providerCredentialsId ||
            !device.targetTemperature
          ) {
            continue;
          }

          const providerCredential =
            await this.providerCredentialsService.findOne(
              device.providerCredentialsId,
            );

          if (!providerCredential) {
            continue;
          }

          const provider = await this.providersService.findOne(
            providerCredential.providerId,
          );

          if (!provider) {
            continue;
          }

          if (isPeakHour && !device.optimized) {
            // Adjust temperature for peak hour only if not already adjusted (optimized)
            const newTemperature = device.targetTemperature + temperatureOffset;
            await this.millService.setTemperature(
              device.externalRef,
              device.type,
              provider,
              providerCredential.userId,
              newTemperature,
            );

            await this.devicesService.update(device.id, {
              targetTemperature: newTemperature,
              optimized: true,
            });
            this.logger.debug(`Temperature adjusted for device ${device.id}`);
          } else if (device.optimized) {
            // Reset temperature to normal only if was already optimized
            const newTemperature = device.targetTemperature - temperatureOffset;
            await this.millService.setTemperature(
              device.externalRef,
              device.type,
              provider,
              providerCredential.userId,
              newTemperature,
            );

            await this.devicesService.update(device.id, {
              targetTemperature: newTemperature,
              optimized: false,
            });
            this.logger.debug(
              `Temperature reset for device ${device.id} to ${newTemperature}`,
            );
          }
        }
      }

      this.logger.debug(
        'Peak hour temperature adjustment completed successfully',
      );
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error processing peak hour adjustment: ${errorMessage}`,
      );
      throw error;
    }
  }

  @OnQueueEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(
      `Job ${job.id} completed with result: ${JSON.stringify(result)}`,
    );
  }

  @OnQueueEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
