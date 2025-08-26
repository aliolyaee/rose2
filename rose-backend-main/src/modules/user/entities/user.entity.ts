import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { EntityNameEnum } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { Roles } from 'src/common/enums/role.enum';

@Entity(EntityNameEnum.USER)
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  fullName: string;
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  username: string;
  @Column({ nullable: false, default: Roles.User })
  role: string;
  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;
  @Column({ nullable: true })
  lastLogin: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
