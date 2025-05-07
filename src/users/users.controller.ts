import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from '@app/auth/guards/jwt/jwt.guard';
import { RequestWithUser } from '@app/auth/interfaces/auth.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<User> {
    // Regular users can only access their own profile
    if (req.user.id !== +id && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only access your own user profile');
    }

    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: RequestWithUser,
  ): Promise<User> {
    // Regular users can only update their own profile
    if (req.user.id !== +id && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own user profile');
    }

    // Regular users cannot change their role
    if (updateUserDto.role && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can change user roles');
    }

    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }
}
