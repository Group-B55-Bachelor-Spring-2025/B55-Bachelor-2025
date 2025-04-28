import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('pages/index')
  getHello() {
    return { message: this.appService.getHello(), title: 'Home' };
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
