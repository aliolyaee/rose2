import { forwardRef, Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { ClientEntity } from './entities/client.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { ReservationModule } from '../reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientEntity]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [TypeOrmModule],
})
export class ClientsModule {}
