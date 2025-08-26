import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
}