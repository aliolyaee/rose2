import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

export class PlaceOrderDto {
  @ApiProperty()
  @IsString({ message: 'نام مشتری باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن نام مشتری الزامی است.' })
  customerName: string;

  @ApiProperty()
  @IsPhoneNumber('IR', {
    message: 'شماره تلفن باید یک شماره معتبر ایرانی باشد.',
  })
  @IsNotEmpty({ message: 'وارد کردن شماره تلفن الزامی است.' })
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'توضیحات باید یک رشته باشد.' })
  description?: string;

  @ApiProperty()
  @IsNumber({}, { message: 'شناسه میز باید یک عدد باشد.' })
  @IsNotEmpty({ message: 'وارد کردن شناسه میز الزامی است.' })
  tableId: number;
}
