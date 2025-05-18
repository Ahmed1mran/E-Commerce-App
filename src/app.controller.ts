import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './common/guard/authentication/authentication.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  // @UseGuards(AuthenticationGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
