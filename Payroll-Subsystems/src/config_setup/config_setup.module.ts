import { Module } from '@nestjs/common';
import { ConfigSetupService } from './config_setup.service';
import { ConfigSetupController } from './config_setup.controller';

@Module({
  controllers: [ConfigSetupController],
  providers: [ConfigSetupService],
})
export class ConfigSetupModule {}
