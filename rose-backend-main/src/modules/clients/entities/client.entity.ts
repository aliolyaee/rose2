import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { Order } from '../../order/entities/order.entity';
import { ReservationEntity } from '../../reservation/entities/reservation.entity';

@Entity('clients')
export class ClientEntity extends BaseEntity {
  @Column()
  fullName: string;
  @Column({ unique: true })
  phone: string;
  @OneToMany(() => Order, (order) => order.client)
  orders: Order[];
  @OneToMany(() => ReservationEntity, (reserve) => reserve.client)
  reservations: ReservationEntity[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
