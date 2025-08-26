// check-availability.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CheckAvailabilityDto {
  @ApiProperty({ example: '2025-08-23' })
  @IsNotEmpty({ message: 'وارد کردن تاریخ الزامی است.' })
  date: string;

  @ApiProperty({ example: '19:30' })
  @IsNotEmpty({ message: 'وارد کردن ساعت الزامی است.' })
  @IsString({ message: 'ساعت باید یک رشته باشد.' })
  hour: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 3 })
  @IsNotEmpty({ message: 'وارد کردن مدت زمان الزامی است.' })
  @Type(() => Number)
  @IsInt({ message: 'مدت زمان باید عدد صحیح باشد.' })
  @Min(1, { message: 'مدت زمان باید حداقل ۱ باشد.' })
  @Max(3, { message: 'مدت زمان نمی‌تواند بیشتر از ۳ باشد.' })
  duration: number;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsNotEmpty({ message: 'وارد کردن تعداد افراد الزامی است.' })
  @Type(() => Number)
  @IsInt({ message: 'تعداد افراد باید عدد صحیح باشد.' })
  @Min(1, { message: 'تعداد افراد باید حداقل ۱ باشد.' })
  people: number;

  @ApiProperty({ example: 12, description: 'شناسه رستوران انتخاب‌شده' })
  @IsNotEmpty({ message: 'شناسه رستوران الزامی است.' })
  @Type(() => Number)
  @IsInt({ message: 'شناسه رستوران باید عدد صحیح باشد.' })
  restaurantId: number;
}
