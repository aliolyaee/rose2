import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EntityNameEnum } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { ReservationEntity } from '../../reservation/entities/reservation.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { Restaurant } from '../../resturants/entities/resturant.entity';

@Entity(EntityNameEnum.TABLES)
export class TableEntity extends BaseEntity {
    @OneToMany(() => ReservationEntity, (reserve) => reserve.table)
    reservation: ReservationEntity[];

    @OneToMany(() => Order, (order) => order.table)
    orders: Order[];

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    capacity: number;

    @Column()
    photo: string;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.tables, {
        onDelete: 'CASCADE',
    })
    restaurant: Restaurant;
}
