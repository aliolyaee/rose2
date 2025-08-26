import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { ItemCategory } from './entities/item-category.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([MenuItem, ItemCategory])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
