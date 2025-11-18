import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackingModule } from './tracking/tracking.module';
import { ConfigSetupModule } from './config_setup/config_setup.module';
import { ExecutionModule } from './execution/execution.module';

@Module({
  imports: [TrackingModule, ConfigSetupModule, ExecutionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
