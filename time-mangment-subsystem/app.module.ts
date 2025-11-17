// src/app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AttendanceModule } from "./attendance/attendacne.module";

@Module({
  imports: [
    // Load environment variables once for the whole subsystem
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../.env"] }),

    // Local DB connection for this subsystem (reads MONGODB_URI or MONGO_* parts)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri =
          config.get<string>("MONGODB_URI") || config.get<string>("MONGO_URI");
        if (uri) return { uri };

        const user = encodeURIComponent(config.get<string>("MONGO_USER") || "");
        const pass = encodeURIComponent(config.get<string>("MONGO_PASS") || "");
        const host = config.get<string>("MONGO_HOST") || "";
        const db = config.get<string>("MONGO_DB") || "test";
        const options =
          config.get<string>("MONGO_OPTIONS") || "?retryWrites=true&w=majority";
        const credentials = user || pass ? `${user}:${pass}@` : "";
        return { uri: `mongodb+srv://${credentials}${host}/${db}${options}` };
      },
    }),
    // Subsystem feature module
    AttendanceModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
