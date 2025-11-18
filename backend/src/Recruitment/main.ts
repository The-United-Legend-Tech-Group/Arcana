import { NestFactory } from '@nestjs/core';
import { recruitmentModule } from './recruitment.module';

async function bootstrap() {
  const app = await NestFactory.create(recruitmentModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
