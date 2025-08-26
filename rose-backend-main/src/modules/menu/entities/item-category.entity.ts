import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { MenuItem } from './menu-item.entity';
import { Restaurant } from '../../resturants/entities/resturant.entity'; // <- adjust path if needed

@Entity('item_categories')
@Unique('uq_item_categories_restaurant_name', ['restaurantId', 'name']) // unique per restaurant
export class ItemCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string; // removed global unique: true

  @Column({ type: 'varchar', length: 100, nullable: false })
  icon: string;

  @ManyToOne(() => Restaurant, (r) => r.itemCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @Column({ type: 'int' })
  @Index('idx_item_categories_restaurant_id')
  restaurantId: number;

  @OneToMany(() => MenuItem, (item) => item.category)
  items: MenuItem[];
}
