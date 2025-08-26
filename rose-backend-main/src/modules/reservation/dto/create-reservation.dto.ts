import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'شناسه میز باید عدد صحیح باشد.' })
  tableId: number;

  @ApiProperty()
  @IsString({ message: 'تاریخ باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن تاریخ الزامی است.' })
  date: string;

  @ApiProperty()
  @IsString({ message: 'ساعت باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن ساعت الزامی است.' })
  hour: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'مدت زمان باید عدد صحیح باشد.' })
  duration: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'تعداد افراد باید عدد صحیح باشد.' })
  people: number;

  @ApiProperty()
  @IsString({ message: 'شماره تلفن باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن شماره تلفن الزامی است.' })
  phone: string;

  @ApiProperty()
  @IsString({ message: 'نام و نام خانوادگی باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن نام و نام خانوادگی الزامی است.' })
  fullName: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'توضیحات باید یک رشته باشد.' })
  description?: string;
}
export class UpdateReservationDto extends PartialType(CreateReservationDto) {}
