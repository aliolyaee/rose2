// src/modules/reservation/entities/reservation.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { TableEntity } from '../../tables/entities/table.entity';
import { EntityNameEnum } from '../../../common/enums/entity.enum';
import { ClientEntity } from '../../clients/entities/client.entity';

@Entity(EntityNameEnum.RESERVATIONS)
export class ReservationEntity extends BaseEntity {
  @ManyToOne(() => TableEntity, (table) => table.reservation)
  table: TableEntity;

  @Column()
  date: string; // e.g. '2024-06-01'

  @Column()
  hour: string; // e.g. '18:00'

  @Column()
  duration: number; // in hours

  @Column()
  people: number;

  @Column()
  phone: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  trackingCode: string;

  @ManyToOne(() => ClientEntity, (client) => client.reservations, {
    nullable: false,
  })
  client: ClientEntity;

  @Column({ nullable: true })
  clientId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
