import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) { }

  // Application Configuration
  get port(): number {
    return this.configService.get<number>('port')!;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('nodeEnv')!;
  }

  // Environment Helpers
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  // Database Configuration
  get databaseUri(): string {
    const uri = this.configService.get<string>('database.uri');
    if (!uri) {
      throw new Error(
        'MONGO_URI is required. Please set it in your environment variables.',
      );
    }
    return uri;
  }

  // JWT Configuration
  get jwtSecret(): string {
    return this.configService.get<string>('jwt.secret')!;
  }

  get jwtAccessTokenSecret(): string {
    return this.configService.get<string>('jwt.accessTokenSecret')!;
  }

  get jwtAccessTokenExpiresIn(): string {
    return this.configService.get<string>('jwt.accessTokenExpiresIn')!;
  }

  get jwtRefreshTokenSecret(): string {
    return this.configService.get<string>('jwt.refreshTokenSecret')!;
  }

  get jwtRefreshTokenExpiresIn(): string {
    return this.configService.get<string>('jwt.refreshTokenExpiresIn')!;
  }

  // Gemini AI Configuration
  get geminiApiKey(): string {
    return this.configService.get<string>('gemini.apiKey') || '';
  }

  // Groq AI Configuration
  get groqApiKey(): string {
    return this.configService.get<string>('groq.apiKey') || '';
  }
}

