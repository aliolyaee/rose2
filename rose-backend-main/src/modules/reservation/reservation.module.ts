import { forwardRef, Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableEntity } from '../tables/entities/table.entity';
import { ReservationEntity } from './entities/reservation.entity';
import { TablesModule } from '../tables/tables.module';
import { AuthModule } from '../auth/auth.module';
import { OrderModule } from '../order/order.module';
import { ClientsModule } from '../clients/clients.module';
import { ClientsService } from '../clients/clients.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationEntity]),
    AuthModule,
    forwardRef(() => TablesModule),
    forwardRef(() => ClientsModule),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, ClientsService],
  exports: [TypeOrmModule],
})
export class ReservationModule {}
