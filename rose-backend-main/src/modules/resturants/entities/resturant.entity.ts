// resturant.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TableEntity } from '../../tables/entities/table.entity';
import { ItemCategory } from '../../menu/entities/item-category.entity';

@Entity('resturants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // make it nullable + optional
  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => TableEntity, (t) => t.restaurant)
  tables: TableEntity[];

  @OneToMany(() => ItemCategory, (c) => c.restaurant)
  itemCategories: ItemCategory[];
}
