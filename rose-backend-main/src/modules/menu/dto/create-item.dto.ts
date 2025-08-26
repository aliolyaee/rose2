import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiPropertyOptional()
  @IsString({ message: 'تصویر باید یک رشته باشد.' })
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString({ message: 'عنوان باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن عنوان الزامی است.' })
  title: string;

  @ApiPropertyOptional()
  @IsString({ message: 'توضیحات باید یک رشته باشد.' })
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber({}, { message: 'قیمت باید یک عدد باشد.' })
  @IsNotEmpty({ message: 'وارد کردن قیمت الزامی است.' })
  fee: number;

  @ApiPropertyOptional()
  @IsBoolean({ message: 'وضعیت موجود بودن باید یک مقدار بولی باشد.' })
  @IsOptional()
  available?: boolean;

  @ApiProperty()
  @IsNumber({}, { message: 'شناسه دسته‌بندی باید یک عدد باشد.' })
  @IsNotEmpty({ message: 'وارد کردن شناسه دسته‌بندی الزامی است.' })
  categoryId: number;
}

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}
