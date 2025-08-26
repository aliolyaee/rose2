import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CartItem } from '../entities/cart-item.entity';
import { generateTrackingCode } from 'src/common/utils/functions.util';
import { TableEntity } from 'src/modules/tables/entities/table.entity';
import { ClientsService } from '../../clients/clients.service';
import * as moment from 'jalali-moment';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,

    private clientsService: ClientsService,

    private dataSource: DataSource,
  ) {}

  async placeOrder(
    sessionId: string,
    name: string,
    phone: string,
    description?: string,
    tableId?: number,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const cartItems = await manager.find(CartItem, {
        where: { sessionId, ordered: false },
        relations: ['menuItem'],
      });

      if (!cartItems.length) {
        throw new BadRequestException('سبد خرید خالی است.');
      }

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of cartItems) {
        const subtotal = Number(item.menuItem.fee) * item.quantity;
        totalPrice += subtotal;

        orderItems.push(
          manager.create(OrderItem, {
            menuItem: item.menuItem,
            quantity: item.quantity,
            fee: item.menuItem.fee,
          }),
        );
      }

      const trackingCode = generateTrackingCode();
      if (!tableId) {
        throw new BadRequestException('شناسه میز الزامی است.');
      }
      const table = await manager.findOne(TableEntity, {
        where: { id: tableId },
      });
      if (!table) throw new BadRequestException('میز پیدا نشد.');

      const client = await this.clientsService.createClient(name, phone);
      const order = manager.create(Order, {
        customerName: name,
        phoneNumber: phone,
        clientId: client.id,
        client: client,
        description,
        totalPrice,
        items: orderItems,
        trackingCode,
        table,
      });

      const savedOrder = await manager.save(Order, order);

      await manager
        .createQueryBuilder()
        .update(CartItem)
        .set({ ordered: true })
        .where('id IN (:...ids)', { ids: cartItems.map((ci) => ci.id) })
        .execute();

      const result = await manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.menuItem', 'table'],
      });

      // Add Jalali dates to the result
      if (result) {
        return {
          ...result,
          createdAtJalali: moment(result.createdAt).locale('fa').format('YYYY-MM-DD HH:mm'),
          updatedAtJalali: moment(result.updatedAt).locale('fa').format('YYYY-MM-DD HH:mm'),
        };
      }
      return result;
    });
  }

  async getOrdersByPhone(phone: string) {
    const orders = await this.orderRepo.find({
      where: { phoneNumber: phone },
      relations: ['items', 'items.menuItem'],
    });
    return orders.map(order => ({
      ...order,
      createdAtJalali: moment(order.createdAt).locale('fa').format('YYYY-MM-DD HH:mm'),
      updatedAtJalali: moment(order.updatedAt).locale('fa').format('YYYY-MM-DD HH:mm'),
    }));
  }

  async getAllOrders() {
    const orders = await this.orderRepo.find({ relations: ['items', 'items.menuItem', 'table'] });
    return orders.map(order => ({
      ...order,
      createdAtJalali: moment(order.createdAt).locale('fa').format('YYYY-MM-DD HH:mm'),
      updatedAtJalali: moment(order.updatedAt).locale('fa').format('YYYY-MM-DD HH:mm'),
    }));
  }

  async getOrderById(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.menuItem', 'table'],
    });
    if (!order) return null;
    return {
      ...order,
      createdAtJalali: moment(order.createdAt).locale('fa').format('YYYY-MM-DD HH:mm'),
      updatedAtJalali: moment(order.updatedAt).locale('fa').format('YYYY-MM-DD HH:mm'),
    };
  }

  async updateOrder(id: number, dto: Partial<Order>) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('سفارش پیدا نشد.');
    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async deleteOrder(id: number) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('سفارش پیدا نشد.');
    await this.orderRepo.delete(id);
    return { message: 'سفارش با موفقیت حذف شد.' };
  }
}