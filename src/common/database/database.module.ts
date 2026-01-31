import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schemas';
import type { DbConfig } from '@/common/config';

const DRIZZLE = 'DRIZZLE_CONNECTION';

@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService,
      ): Promise<NodePgDatabase<typeof schema>> => {
        const db = config.getOrThrow<DbConfig>('db');

        const pool = new Pool({
          host: db.HOST,
          port: db.PORT,
          user: db.USER,
          password: db.PASSWORD,
          database: db.NAME,
          ssl: db.SSL
        });

        const client = await pool.connect();
        client.release();

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
