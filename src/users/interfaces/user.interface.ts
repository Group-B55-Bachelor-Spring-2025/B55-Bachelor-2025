import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

export interface IUsersService {
  /**
   * Create a new user
   * @param createUserDto User data to create
   * @returns Newly created user
   */
  create(createUserDto: CreateUserDto): Promise<User>;

  /**
   * Find all users
   * @returns Array of all users
   */
  findAll(): Promise<User[]>;

  /**
   * Find a user by their ID
   * @param id User ID to find
   * @returns User if found
   * @throws NotFoundException if user doesn't exist
   */
  findOne(id: number): Promise<User>;

  /**
   * Update a user
   * @param id User ID to update
   * @param updateUserDto Updated user data
   * @returns Updated user
   * @throws NotFoundException if user doesn't exist
   */
  update(id: number, updateUserDto: UpdateUserDto): Promise<User>;

  /**
   * Remove a user
   * @param id User ID to remove
   * @throws NotFoundException if user doesn't exist
   */
  remove(id: number): Promise<void>;

  /**
   * Find a user by their email
   * @param email Email to search for
   * @returns User if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;
}
