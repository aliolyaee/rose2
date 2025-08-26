import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { ItemCategory } from './item-category.entity';

@Entity('menu_items')
export class MenuItem extends BaseEntity {
  @Column({ type: 'varchar', length: 400, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bigint', nullable: false, default: 0 })
  fee: number;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @ManyToOne(() => ItemCategory, (category) => category.items)
  category: ItemCategory;
}
