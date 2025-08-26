import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { MenuItem } from 'src/modules/menu/entities/menu-item.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => MenuItem)
  menuItem: MenuItem;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'varchar', length: 60 })
  sessionId: string;

  @Column({ type: 'boolean', default: false })
  ordered: boolean;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
