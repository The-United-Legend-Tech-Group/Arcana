import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './src/employee/employee.module';
import { OrganizationStructureModule } from './src/organization-structure/organization-structure.module';
import { NotificationModule } from './src/notification/notification.module';
import { ProfileChangeRequestModule } from './src/profile-change-request/profile-change-request.module';
import { AuthModule } from './src/auth/auth.module';

@Module({
  imports: [
    //.env
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri =
          config.get<string>('MONGODB_URI') || config.get<string>('MONGO_URI');
        if (uri) return { uri };

        const user = encodeURIComponent(config.get<string>('MONGO_USER') || '');
        const pass = encodeURIComponent(config.get<string>('MONGO_PASS') || '');
        const host = config.get<string>('MONGO_HOST') || '';
        const db = config.get<string>('MONGO_DB') || 'test';
        const options =
          config.get<string>('MONGO_OPTIONS') || '?retryWrites=true&w=majority';
        const credentials = user || pass ? `${user}:${pass}@` : '';
        return { uri: `mongodb+srv://${credentials}${host}/${db}${options}` };
      },
    }),

    EmployeeModule,
    OrganizationStructureModule,
    NotificationModule,
    ProfileChangeRequestModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
