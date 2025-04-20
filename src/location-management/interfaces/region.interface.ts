export interface RegionProps {
  code: string;
  name: string;
  countryCode: string;
  eicCode: string;
  active?: boolean;
}

export interface IRegionsService {
  findAll(): Promise<RegionProps[]>;
  findByCode(code: string): Promise<RegionProps>;
}
