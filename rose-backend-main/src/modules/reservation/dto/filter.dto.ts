import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterReservationDto {
  @ApiPropertyOptional({ description: 'جستجو بر اساس شماره تلفن یا کد پیگیری' })
  @IsOptional()
  @IsString({ message: 'عبارت جستجو باید یک رشته باشد.' })
  search?: string;

  @ApiPropertyOptional({
    description: 'ایجاد شده بعد از این تاریخ (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString({ message: 'تاریخ باید یک رشته باشد.' })
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'ایجاد شده قبل از این تاریخ (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString({ message: 'تاریخ باید یک رشته باشد.' })
  createdBefore?: string;
}
