import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('/api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @ApiOkResponse({
    type: 'Hello World!',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
