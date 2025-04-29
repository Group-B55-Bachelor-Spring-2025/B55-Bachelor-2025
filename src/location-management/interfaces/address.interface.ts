import { Role } from '@app/users/enums/role.enum';
export interface AddressProps {
  id?: number;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  regionCode: string;
}

export interface IAddressesService {
  create(address: AddressProps, userId: number): Promise<AddressProps>;
  findAll(roloe: Role, userId: number): Promise<AddressProps[]>;
  findOne(id: number): Promise<AddressProps>;
  update(id: number, address: AddressProps): Promise<AddressProps>;
  remove(id: number): Promise<AddressProps>;
}
