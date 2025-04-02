import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertRegionData1743580382974 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO regions (code, name, country_code, eic_code, active) VALUES
            ('UK', 'Great Britain', 'GB', '10Y1001A1001A57G', false),
            ('50Hz', '50Hertz Transmission GmbH', 'DE', '10YDE-VE-------2', false),
            ('TBW', 'TransnetBW', 'DE', '10YDE-ENBW-----N', false),
            ('AMP', 'Amprion', 'DE', '10YDE-RWENET---I', false),
            ('TTG', 'TenneT Germany', 'DE', '10YDE-EON------1', false),
            ('AT', 'Austria', 'AT', '10YAT-APG------L', false),
            ('NL', 'Netherlands', 'NL', '10YNL----------L', false),
            ('FR', 'France', 'FR', '10YFR-RTE------C', false),
            ('NO1', 'NO1 Norway', 'NO', '10YNO-1--------2', false),
            ('NO2', 'NO2 Norway', 'NO', '10YNO-2--------T', false),
            ('NO3', 'NO3 Norway', 'NO', '10YNO-3--------J', false),
            ('NO4', 'NO4 Norway', 'NO', '10YNO-4--------9', false),
            ('NO5', 'NO5 Norway', 'NO', '10Y1001A1001A48H', false),
            ('FI', 'Finland', 'FI', '10YFI-1--------U', false),
            ('BE', 'Belgium', 'BE', '10YBE----------2', false),
            ('DK1', 'DK1 Denmark', 'DK', '10YDK-1--------W', false),
            ('DK2', 'DK2 Denmark', 'DK', '10YDK-2--------M', false),
            ('SE1', 'SE1 Sweden', 'SE', '10Y1001A1001A44P', false),
            ('SE2', 'SE2 Sweden', 'SE', '10Y1001A1001A45N', false),
            ('SE3', 'SE3 Sweden', 'SE', '10Y1001A1001A46L', false),
            ('SE4', 'SE4 Sweden', 'SE', '10Y1001A1001A47J', false),
            ('EE', 'Estonia', 'EE', '10Y1001A1001A39I', false),
            ('LV', 'Latvia', 'LV', '10YLV-1001A00074', false),
            ('LT', 'Lithuania', 'LT', '10YLT-1001A0008Q', false),
            ('PL', 'Poland', 'PL', '10YPL-AREA-----S', false)
            ON CONFLICT (code) DO UPDATE 
            SET name = EXCLUDED.name, 
                country_code = EXCLUDED.country_code,
                eic_code = EXCLUDED.eic_code,
                active = EXCLUDED.active
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM regions`);
  }
}
