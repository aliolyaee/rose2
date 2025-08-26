import { forwardRef, Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableEntity } from './entities/table.entity';
import { ReservationModule } from '../reservation/reservation.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableEntity]),
    AuthModule,
  ],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TypeOrmModule],
})
export class TablesModule {}