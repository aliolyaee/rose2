import { Module } from '@nestjs/common';
import { ResturantsService } from './resturants.service';
import { ResturantsController } from './resturants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/resturant.entity';
import { TableEntity } from '../tables/entities/table.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, TableEntity]),
  ],
  controllers: [ResturantsController],
  providers: [ResturantsService],
})
export class ResturantsModule { }
