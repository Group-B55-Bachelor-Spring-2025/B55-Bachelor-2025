import { Processor, OnQueueEvent, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProviderCredentialsService } from '@app/provider-management/core/credentials/provider-credentials.service';
import { ProvidersService } from '@app/provider-management/core/providers/providers.service';
import { MillService } from '@app/provider-management/adapters/mill/mill.service';
import { DEVICE_UPDATE_QUEUE } from './device-update.queue';
import { DevicesService } from '@app/device-management/devices/devices.service';
import { UpdateDeviceDto } from '@app/device-management/devices/dto/update-device.dto';

@Injectable()
@Processor(DEVICE_UPDATE_QUEUE)
export class DeviceUpdateProcessor extends WorkerHost {
  private readonly logger = new Logger(DeviceUpdateProcessor.name);

  constructor(
    private readonly devicesService: DevicesService,
    private readonly providersService: ProvidersService,
    private readonly millService: MillService,
    private readonly providerCredentialsService: ProviderCredentialsService,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'update-all-devices') {
      return;
    }

    this.logger.log(`Starting device update job #${job.id}`);
    const startTime = Date.now();

    try {
      // 1. Find all Mill provider
      const millProvider = await this.providersService.findByName('mill');

      if (!millProvider) {
        this.logger.warn('Mill provider not found');
        return { success: false, reason: 'Mill provider not found' };
      }

      // 2. Find all credentials for Mill provider
      const credentials =
        await this.providerCredentialsService.findAllByProviderId(
          millProvider.id,
        );

      if (credentials.length === 0) {
        this.logger.log('No Mill provider credentials found');
        return { success: true, devicesUpdated: 0 };
      }

      // 3. For each user with Mill credentials, update their devices
      let totalDevicesUpdated = 0;
      let failedUpdates = 0;

      for (const credential of credentials) {
        try {
          // Find all devices for this user credential
          const devices = await this.devicesService.findAllByCredentialId(
            credential.id,
          );

          for (const device of devices) {
            try {
              // Get the latest device data from Mill API
              const millDevice = await this.millService.getDevice(
                millProvider,
                credential.userId,
                device.externalRef,
              );

              const updateDeviceDto: UpdateDeviceDto = {
                status: millDevice.offline ? 'offline' : 'online',
                settings: JSON.stringify({
                  temperature: millDevice.temperature,
                  targetTemperature: millDevice.targetTemperature,
                  ...JSON.parse(device.settings || '{}'),
                }),
                targetTemperature:
                  millDevice.targetTemperature || device.targetTemperature,
                lastSync: new Date(),
              };

              await this.devicesService.update(device.id, updateDeviceDto);
              totalDevicesUpdated++;
            } catch (error) {
              const errorMsg =
                error instanceof Error ? error.message : 'Unknown error';
              this.logger.error(
                `Failed to update device ${device.id} (${device.name}): ${errorMsg}`,
              );
              failedUpdates++;
            }
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to process user ${credential.userId}: ${errorMsg}`,
          );
          failedUpdates++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Device update job completed in ${duration}ms. Updated ${totalDevicesUpdated} devices. Failed: ${failedUpdates}`,
      );

      return {
        success: true,
        devicesUpdated: totalDevicesUpdated,
        failedUpdates,
        duration,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Device update job failed: ${errorMsg}`);
      throw error; // Rethrow to let BullMQ handle retries
    }
  }

  @OnQueueEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(
      `Job ${job.id} completed. Updated ${result?.devicesUpdated || 0} devices.`,
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
