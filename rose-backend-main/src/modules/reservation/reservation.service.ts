import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, MoreThanOrEqual } from 'typeorm';
import * as moment from 'jalali-moment';

import { ReservationEntity } from './entities/reservation.entity';
import { TableEntity } from '../tables/entities/table.entity';
import { CreateReservationDto, UpdateReservationDto } from './dto/create-reservation.dto';
import { CheckAvailabilityDto } from './dto/check-availablity.dto';
import { FilterReservationDto } from './dto/filter.dto';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly reservationRepository: Repository<ReservationEntity>,
    @InjectRepository(TableEntity)
    private readonly tableRepository: Repository<TableEntity>,
    private readonly clientsService: ClientsService,
  ) {}

  /**
   * Return available tables for a specific restaurant that:
   * - have capacity >= people
   * - do NOT overlap with existing reservations for [date, hour, duration]
   */
  async getAvailableTables(dto: CheckAvailabilityDto) {
    const { date, hour, duration, people, restaurantId } = dto as CheckAvailabilityDto & {
      restaurantId: number;
    };

    if (!restaurantId) {
      throw new BadRequestException('شناسه رستوران الزامی است.');
    }

    // Strict parse and compare as moment objects
    const startTime = moment(`${date} ${hour}`, 'YYYY-MM-DD HH:mm', true);
    if (!startTime.isValid()) {
      throw new BadRequestException('تاریخ/ساعت معتبر نیست.');
    }
    if (startTime.isBefore(moment())) {
      throw new BadRequestException('امکان رزرو در زمان سپری شده نیست.');
    }
    const endTime = startTime.clone().add(duration, 'hours');

    // Load reservations for this restaurant on the same date
    const reservations = await this.reservationRepository.find({
      where: {
        date,
        table: { restaurant: { id: restaurantId } },
      },
      relations: ['table', 'table.restaurant'],
    });

    // Which table ids conflict (time overlap)?
    const conflictingTableIds = reservations
      .filter((res) => {
        const resStart = moment(`${res.date} ${res.hour}`, 'YYYY-MM-DD HH:mm', true);
        if (!resStart.isValid()) return false;
        const resEnd = resStart.clone().add(res.duration, 'hours');
        return startTime.isBefore(resEnd) && endTime.isAfter(resStart);
      })
      .map((r) => r.table.id);

    // Only tables in this restaurant, with enough capacity, excluding conflicts
    const where: any = {
      capacity: MoreThanOrEqual(people),
      restaurant: { id: restaurantId },
    };
    if (conflictingTableIds.length) {
      where.id = Not(In(conflictingTableIds));
    }

    return this.tableRepository.find({
      where,
      order: { capacity: 'ASC' },
    });
  }

  /**
   * Create a reservation after verifying that the chosen table
   * is available for the requested window.
   */
  async createReservation(dto: CreateReservationDto) {
    const {
      tableId,
      date,
      hour,
      duration,
      people,
      fullName,
      description,
      phone,
    } = dto;

    const startTime = moment(`${date} ${hour}`, 'YYYY-MM-DD HH:mm', true);
    if (!startTime.isValid()) {
      throw new BadRequestException('تاریخ/ساعت معتبر نیست.');
    }
    if (startTime.isBefore(moment())) {
      throw new BadRequestException('امکان رزرو وجود ندارد.');
    }

    // Ensure table exists and get its restaurant
    const table = await this.tableRepository.findOne({
      where: { id: Number(tableId) },
      relations: ['restaurant'],
    });
    if (!table) throw new NotFoundException('میز مورد نظر یافت نشد.');

    // Create/get client
    const client = await this.clientsService.createClient(fullName, phone);

    // Check availability scoped to this table's restaurant
    const availableTables = await this.getAvailableTables({
      date,
      hour,
      duration,
      people,
      // derive restaurantId from selected table
      restaurantId: table.restaurant.id,
    } as any);

    const isAvailable = availableTables.some((t) => t.id === Number(tableId));
    if (!isAvailable) {
      throw new BadRequestException('این میز در این ساعت در دسترس نیست.');
    }

    // You had generateTrackingCode imported; keep as before
    const trackingCode = /* generateTrackingCode() */ Math.random().toString(36).slice(2, 10).toUpperCase();

    const reservation = this.reservationRepository.create({
      ...dto,
      table: { id: Number(tableId) } as any,
      client,
      clientId: client.id,
      trackingCode,
    });
    await this.reservationRepository.save(reservation);
    return { trackingCode };
  }

  /**
   * Admin list with optional filters; keeps your ILIKE usage (Postgres).
   */
  async adminListReservations(filter: FilterReservationDto) {
    const { search, createdAfter, createdBefore } = filter;
    const query = this.reservationRepository.createQueryBuilder('reservation');

    if (search) {
      query.andWhere(
        '(reservation.phone ILIKE :search OR reservation.trackingCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (createdAfter) {
      const afterDate = moment(createdAfter, 'YYYY-MM-DD', true).startOf('day').toDate();
      query.andWhere('reservation.createdAt >= :createdAfter', { createdAfter: afterDate });
    }
    if (createdBefore) {
      const beforeDate = moment(createdBefore, 'YYYY-MM-DD', true).endOf('day').toDate();
      query.andWhere('reservation.createdAt <= :createdBefore', { createdBefore: beforeDate });
    }

    query.leftJoinAndSelect('reservation.table', 'table');
    query.orderBy('reservation.createdAt', 'DESC');

    const reservations = await query.getMany();

    return reservations.map((res) => ({
      ...res,
      createdAtJalali: moment(res.createdAt).locale('fa').format('YYYY-MM-DD HH:mm'),
    }));
  }

  async findOneForAdmin(id: number) {
    const reservation = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.table', 'table')
      .where('reservation.id = :id', { id })
      .getOne();

    if (!reservation) throw new NotFoundException('این رزرو پیدا نشد');

    return {
      ...reservation,
      createdAtJalali: moment(reservation.createdAt).locale('fa').format('YYYY-MM-DD HH:mm'),
    };
    }

  async updateReservation(id: number, dto: UpdateReservationDto) {
    const reservation = await this.reservationRepository.findOneBy({ id });
    if (!reservation) throw new NotFoundException('این رزرو پیدا نشد');

    Object.assign(reservation, dto);
    await this.reservationRepository.save(reservation);
    return reservation;
  }

  async deleteReservation(id: number) {
    const reservation = await this.reservationRepository.findOneBy({ id });
    if (!reservation) throw new NotFoundException('این رزرو پیدا نشد');

    await this.reservationRepository.delete(id);
    return { message: 'رزرو با موفقیت حذف شد.' };
  }
}
