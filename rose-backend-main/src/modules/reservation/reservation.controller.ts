import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  NotFoundException,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
} from './dto/create-reservation.dto';
import { CheckAvailabilityDto } from './dto/check-availablity.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiExtraModels,
  ApiProperty,
} from '@nestjs/swagger';
import { SwaggerConsumesEnum } from '../../common/enums/swagger-consumes.enum';
import { FilterReservationDto } from './dto/filter.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';

/**
 * Swagger helper models (for nicer schemas)
 */
class AvailableTableSwagger {
  @ApiProperty({ example: 17 })
  id: number;

  @ApiProperty({ example: 'Table A1' })
  name: string;

  @ApiProperty({ example: 4, minimum: 1 })
  capacity: number;

  @ApiProperty({ example: 'Window side', nullable: true, required: false })
  description?: string;

  @ApiProperty({ example: 'https://cdn.example.com/tables/a1.jpg', required: false })
  photo?: string;

  @ApiProperty({ example: 12, description: 'Restaurant ID', required: false })
  restaurantId?: number;
}

class CreateReservationResponseSwagger {
  @ApiProperty({ example: 'AB12CD34', description: 'Tracking code of the reservation' })
  trackingCode: string;
}

class AdminReservationSwagger {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: '2025-08-23' })
  date: string;

  @ApiProperty({ example: '19:30' })
  hour: string;

  @ApiProperty({ example: 2 })
  duration: number;

  @ApiProperty({ example: 4 })
  people: number;

  @ApiProperty({ example: '09123456789' })
  phone: string;

  @ApiProperty({ example: 'AB12CD34' })
  trackingCode: string;

  @ApiProperty({ example: 'توضیحات اختیاری', required: false, nullable: true })
  description?: string;

  @ApiProperty({
    example: '1404-06-01 19:45',
    description: 'Jalali-formatted creation timestamp returned for admins',
  })
  createdAtJalali: string;

  @ApiProperty({
    example: { id: 17, name: 'Table A1', capacity: 4 },
    description: 'Joined table entity (partial)',
    required: false,
  })
  table?: Record<string, unknown>;
}

@ApiTags('reservations')
@ApiExtraModels(AvailableTableSwagger, CreateReservationResponseSwagger, AdminReservationSwagger)
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  /**
   * Check available tables for a restaurant at a given date/time window.
   */
  @Get('available')
  @ApiOperation({
    summary: 'List available tables',
    description:
      'Returns tables that match capacity and **do not** conflict with existing reservations for the given date, hour, and duration. Scope by restaurantId.',
  })
  @ApiOkResponse({
    description: 'List of available tables',
    type: AvailableTableSwagger,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Invalid date/time or missing parameters' })
  @ApiNotFoundResponse({ description: 'No tables found for the criteria' })
  @ApiQuery({ name: 'date', example: '2025-08-23', required: true })
  @ApiQuery({ name: 'hour', example: '19:30', required: true })
  @ApiQuery({ name: 'duration', example: 2, required: true })
  @ApiQuery({ name: 'people', example: 4, required: true })
  @ApiQuery({ name: 'restaurantId', example: 12, required: true })
  async checkAvailability(@Query() dto: CheckAvailabilityDto) {
    const availables = await this.reservationService.getAvailableTables(dto);
    if (!availables || availables.length === 0) {
      throw new NotFoundException('میزی با این مشخصات پیدا نشد');
    }
    return availables;
  }

  /**
   * Create a reservation (public).
   */
  @Post('create')
  @ApiOperation({
    summary: 'Create reservation',
    description:
      'Creates a reservation if the selected table is available for the requested time window. Returns a tracking code.',
  })
  @ApiConsumes(SwaggerConsumesEnum.FORM)
  @ApiBody({ type: CreateReservationDto })
  @ApiCreatedResponse({
    description: 'Reservation created successfully',
    type: CreateReservationResponseSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or table not available / past time',
  })
  async create(@Body() dto: CreateReservationDto) {
    return this.reservationService.createReservation(dto);
  }

  /**
   * Admin: list reservations with filters.
   */
  @Get()
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin - list reservations',
    description:
      'Lists reservations with optional filters (search, createdAfter, createdBefore). Returns Jalali-formatted createdAt.',
  })
  @ApiConsumes(
    SwaggerConsumesEnum.JSON,
    SwaggerConsumesEnum.FORM,
    SwaggerConsumesEnum.MULTIPART,
  )
  @ApiOkResponse({
    description: 'List of reservations',
    type: AdminReservationSwagger,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid authentication' })
  @ApiForbiddenResponse({ description: 'Insufficient role (Admin required)' })
  async listReservations(@Query() filter: FilterReservationDto) {
    return this.reservationService.adminListReservations(filter);
  }

  /**
   * Admin: get a reservation by ID.
   */
  @Get(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - get reservation by ID' })
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  @ApiParam({ name: 'id', example: 101, required: true })
  @ApiOkResponse({ description: 'Reservation details', type: AdminReservationSwagger })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid authentication' })
  @ApiForbiddenResponse({ description: 'Insufficient role (Admin required)' })
  async findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.findOneForAdmin(id);
  }

  /**
   * Admin: update a reservation.
   */
  @Patch(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - update reservation' })
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  @ApiParam({ name: 'id', example: 101, required: true })
  @ApiBody({ type: UpdateReservationDto })
  @ApiOkResponse({ description: 'Updated reservation', type: AdminReservationSwagger })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid authentication' })
  @ApiForbiddenResponse({ description: 'Insufficient role (Admin required)' })
  async updateReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationService.updateReservation(id, dto);
  }

  /**
   * Admin: delete a reservation.
   */
  @Delete(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - delete reservation' })
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  @ApiParam({ name: 'id', example: 101, required: true })
  @ApiOkResponse({ description: 'Reservation deleted successfully', schema: {
    example: { message: 'رزرو با موفقیت حذف شد.' },
  }})
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid authentication' })
  @ApiForbiddenResponse({ description: 'Insufficient role (Admin required)' })
  async deleteReservation(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.deleteReservation(id);
  }
}
