import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEntity } from './entities/table.entity';
import { CreateTableDto, UpdateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(TableEntity)
    private tableRepository: Repository<TableEntity>,
  ) {}

  async create(createTableDto: CreateTableDto) {
    const table = this.tableRepository.create(createTableDto);
    return this.tableRepository.save(table);
  }

  async findAll() {
    return this.tableRepository.find();
  }

  async findOne(id: number) {
    const table = await this.tableRepository.findOneBy({ id });
    if (!table) throw new NotFoundException('این میز یافت نشد.');
    return table;
  }

  async update(id: number, dto: UpdateTableDto) {
    const table = await this.tableRepository.findOneBy({ id });
    if (!table) throw new NotFoundException('این میز یافت نشد.');
    Object.assign(table, dto);
    return this.tableRepository.save(table);
  }

  async remove(id: number) {
    const table = await this.tableRepository.findOneBy({ id });
    if (!table) throw new NotFoundException('این میز یافت نشد.');
    await this.tableRepository.delete(id);
    return { message: 'Table deleted successfully' };
  }
}
