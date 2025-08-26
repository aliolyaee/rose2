import { Entity, Column, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { OrderItem } from './order-item.entity';
import { TableEntity } from 'src/modules/tables/entities/table.entity';
import { ClientEntity } from '../../clients/entities/client.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  customerName: string;

  @Column({ type: 'varchar', length: 15 })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bigint' })
  totalPrice: number;

  @Column({ type: 'varchar', length: 16, unique: true })
  trackingCode: string;

  @Column({ nullable: true })
  clientId: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
  @ManyToOne(() => TableEntity, (table) => table.orders, { nullable: false })
  table: TableEntity;
  @ManyToOne(() => ClientEntity, (client) => client.orders, { nullable: false })
  client: ClientEntity;

  @CreateDateColumn()
  createdAt: Date;
  @CreateDateColumn()
  updatedAt: Date;
}
