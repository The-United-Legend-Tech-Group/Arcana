import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { PositionModule } from './position/position.module';

@Module({
  imports: [
    //.env
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule], 
      useFactory: (configService: ConfigService) => ({
        //Get URI from .env
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService], 
    }),

    EmployeeModule,

    DepartmentModule,

    PositionModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}