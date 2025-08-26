import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function TypeOrmDbConfig(): TypeOrmModuleOptions {
  const { DB, DBHOST, DBUSERNAME, DBPORT, DBPASSWORD } = process.env;
  return {
    type: 'postgres',
    database: DB,
    port: DBPORT,
    host: DBHOST,
    username: DBUSERNAME,
    password: DBPASSWORD,
    synchronize: false,
    entities: [
      'dist/**/**/**/*.entity{.ts,.js}',
      'dist/**/**/*.entity{.ts,.js}',
    ],
  };
}