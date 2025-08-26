import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { AuthModule } from '../auth/auth.module';
import { CartController } from './controllers/cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from './services/cart.service';
import { OrderAdminController } from './controllers/order-admin.controller';
import { ClientsModule } from '../clients/clients.module';
import { ClientsService } from '../clients/clients.service';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => ClientsModule),
    TypeOrmModule.forFeature([CartItem, MenuItem, Order, OrderItem]),
  ],
  controllers: [OrderController, CartController, OrderAdminController],
  providers: [OrderService, CartService, ClientsService, TypeOrmModule],
})
export class OrderModule {}
