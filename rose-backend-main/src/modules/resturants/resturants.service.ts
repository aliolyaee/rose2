// resturants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  In,
  ILike,
  Like,
} from 'typeorm';
import { Restaurant } from './entities/resturant.entity';
import { TableEntity } from '../tables/entities/table.entity';
import { CreateResturantDto, UpdateResturantDto } from './dto/create-resturant.dto';

@Injectable()
export class ResturantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(TableEntity)
    private readonly tableRepo: Repository<TableEntity>,
  ) {}

  // CREATE
  async create(dto: CreateResturantDto): Promise<Restaurant> {
    const restaurant = this.restaurantRepo.create({
      name: dto.name,
      // don't pass null; undefined is fine for nullable column
      description: dto.description ?? undefined,
    });

    if (Array.isArray(dto.tableIds) && dto.tableIds.length > 0) {
      const tables = await this.tableRepo.findBy({ id: In(dto.tableIds) });
      if (tables.length !== dto.tableIds.length) {
        throw new NotFoundException('One or more tableIds do not exist');
      }
      restaurant.tables = tables;
    }

    return this.restaurantRepo.save(restaurant);
  }

  // READ ALL
  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Restaurant[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 20));

    let where: FindOptionsWhere<Restaurant>[] | undefined;

    const search = params?.search?.trim();
    if (search) {
      const s = `%${search}%`;
      where = this.isPostgres()
        ? [{ name: ILike(s) }, { description: ILike(s) }]
        : [{ name: Like(s) }, { description: Like(s) }];
    }

    const [data, total] = await this.restaurantRepo.findAndCount({
      where,
      relations: { tables: true },
      // order: { createdAt: 'DESC' }, // enable if you have CreateDateColumn
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  // READ ONE (id is number)
  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: { tables: true },
    });
    if (!restaurant) throw new NotFoundException(`Restaurant ${id} not found`);
    return restaurant;
  }

  // UPDATE
  async update(id: number, dto: UpdateResturantDto): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: { tables: true },
    });
    if (!restaurant) throw new NotFoundException(`Restaurant ${id} not found`);

    if (dto.name !== undefined) restaurant.name = dto.name;
    if (dto.description !== undefined) restaurant.description = dto.description ?? undefined;

    if (Array.isArray(dto.tableIds)) {
      const tables = dto.tableIds.length
        ? await this.tableRepo.findBy({ id: In(dto.tableIds) })
        : [];
      if (tables.length !== dto.tableIds.length) {
        throw new NotFoundException('One or more tableIds do not exist');
      }
      restaurant.tables = tables;
    }

    return this.restaurantRepo.save(restaurant);
  }

  // DELETE
  async remove(id: number): Promise<void> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });
    if (!restaurant) throw new NotFoundException(`Restaurant ${id} not found`);
    await this.restaurantRepo.remove(restaurant);
    // or: await this.restaurantRepo.softDelete(id); if you have DeleteDateColumn
  }

  /** Utils */
  private isPostgres(): boolean {
    // Works for TypeORM 0.3.x
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const type = (this.restaurantRepo.manager.connection.options as any)?.type;
    return type === 'postgres';
  }
}
