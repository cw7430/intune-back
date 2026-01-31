import { registerAs } from '@nestjs/config';

export interface AppConfig {
  APP_ENV: 'local' | 'development' | 'production';
  PORT: number;
  TIME_ZONE: string;
  CHAT_BFF_URL: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    APP_ENV:
      (process.env.NODE_ENV as 'local' | 'development' | 'production') ??
      'local',
    PORT: Number(process.env.PORT ?? 4000),
    TIME_ZONE: process.env.TIME_ZONE ?? 'UTC',
    CHAT_BFF_URL: process.env.TIME_ZONE ?? 'http://localhost:5000',
  }),
);
