import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { Request, Response } from 'express';
import { AddressesService } from './location-management/addresses/addresses.service';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { User } from './users/entities/user.entity';
import { RegionsService } from './location-management/regions/regions.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly addressesService: AddressesService,
    private readonly regionsService: RegionsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('pages/index')
  async getIndex(@CurrentUser() user: User) {
    const addresses = await this.addressesService.findAll(user.role, user.id);
    const regions = await this.regionsService.findAll();
    return { addresses, regions, title: 'Home' };
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
