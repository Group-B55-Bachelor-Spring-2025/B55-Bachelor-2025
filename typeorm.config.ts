import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { DeviceGroup } from 'src/device-management/device-groups/entities/device-group.entity';
import { Device } from 'src/device-management/devices/entities/device.entity';
import { Address } from 'src/location-management/addresses/entities/address.entity';
import { Region } from 'src/location-management/regions/entities/region.entity';
import { Provider } from 'src/provider-management/providers/entities/provider.entity';
import { ProviderCredential } from 'src/provider-management/provider-credentials/entities/provider-credential.entity';
import { SmartControlSetting } from 'src/smart-control/smart-control-settings/entities/smart-control-setting.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [
    Provider,
    ProviderCredential,
    Address,
    Region,
    DeviceGroup,
    Device,
    SmartControlSetting,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
