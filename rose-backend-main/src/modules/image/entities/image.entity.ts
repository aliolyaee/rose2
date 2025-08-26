import { BaseEntity } from '../../../common/abstracts/base.entity';
import { AfterLoad, Column, CreateDateColumn, Entity } from 'typeorm';
import { EntityNameEnum } from '../../../common/enums/entity.enum';
import { env } from 'node:process';
@Entity(EntityNameEnum.IMAGES)
export class ImageEntity extends BaseEntity {
  @Column()
  name: string;
  @Column()
  location: string;
  @Column()
  alt: string;
  @CreateDateColumn()
  created_at: Date;
  @AfterLoad()
  map() {
    this.location = `${env.BASE_URL}${this.location}`;
  }
}
