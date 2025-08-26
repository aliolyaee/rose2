import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './modules/app/app.controller';
import { AppService } from './modules/app/app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from './config/typeorm.config';
import { join } from 'path';
import { TablesModule } from './modules/tables/tables.module';
import { ImageModule } from './modules/image/image.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { MenuModule } from './modules/menu/menu.module';
import { AddUserToRequestMiddleware } from './common/middlewares/addUserToRequest.middleware';
import { SessionIdMiddleware } from './common/middlewares/session-id.middleware';
import { OrderModule } from './modules/order/order.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ResturantsModule } from './modules/resturants/resturants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: TypeOrmDbConfig,
    }),
    AuthModule,
    UserModule,
    TablesModule,
    ImageModule,
    ReservationModule,
    MenuModule,
    OrderModule,
    ClientsModule,
    ResturantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AddUserToRequestMiddleware).forRoutes('*');
    consumer.apply(SessionIdMiddleware).forRoutes('*');
  }
}
