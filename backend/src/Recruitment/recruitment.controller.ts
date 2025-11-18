import { Controller, Get } from '@nestjs/common';
import { recruitmentService } from './recruitment.service';

@Controller()
export class AppController {
  constructor(private readonly appService: recruitmentService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}