import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { Order } from './order.entity';
import { MenuItem } from 'src/modules/menu/entities/menu-item.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => MenuItem)
  menuItem: MenuItem;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'bigint' })
  fee: number;
}
