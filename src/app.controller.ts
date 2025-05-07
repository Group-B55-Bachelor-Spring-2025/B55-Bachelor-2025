import {
  Controller,
  Get,
  Param,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { Request, Response } from 'express';
import { AddressesService } from './location-management/addresses/addresses.service';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { User } from './users/entities/user.entity';
import { RegionsService } from './location-management/regions/regions.service';
import { DeviceGroupsService } from './device-management/device-groups/device-groups.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly addressesService: AddressesService,
    private readonly regionsService: RegionsService,
    private readonly deviceGroupsService: DeviceGroupsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('pages/index')
  async getIndex(@CurrentUser() user: User) {
    const addresses = await this.addressesService.findAll(user.role, user.id);
    const regions = await this.regionsService.findAll();
    return { addresses, regions, title: 'Home' };
  }

  @Get('/address/:id')
  @UseGuards(AuthGuard)
  @Render('pages/addresses/address')
  async getAddress(@CurrentUser() user: User, @Param('id') id: string) {
    const address = await this.addressesService.findOne(+id);

    if (!address) {
      return { error: 'Address not found', title: 'Error' };
    }

    const deviceGroups = await this.deviceGroupsService.findByAddressId(+id);
    return {
      address,
      deviceGroups,
      title: 'Address Details',
    };
  }

  @Get('login')
  loginPage(@Req() req: Request, @Res() res: Response) {
    if (req.cookies && req.cookies['accessToken']) {
      return res.redirect('/');
    }
    return res.render('pages/auth/login', { title: 'Login' });
  }

  @Get('register')
  registerPage(@Req() req: Request, @Res() res: Response) {
    if (req.cookies && req.cookies['accessToken']) {
      return res.redirect('/');
    }
    return res.render('pages/auth/register', { title: 'Register' });
  }
}
