import { Injectable } from '@nestjs/common';

@Injectable()
export class recruitmentService {
  getHello(): string {
    return 'Hello World!';
  }
}
