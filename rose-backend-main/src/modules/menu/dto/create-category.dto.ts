import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Appetizers' })
  @IsString({ message: 'نام دسته‌بندی باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن نام دسته‌بندی الزامی است.' })
  name: string;

  @ApiProperty({ example: 'utensils' })
  @IsString({ message: 'آیکون باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن آیکون الزامی است.' })
  icon: string;

  @ApiProperty({ example: 12, description: 'شناسه رستورانِ مربوط به این دسته‌بندی' })
  @Type(() => Number)
  @IsInt({ message: 'شناسه رستوران باید عدد صحیح باشد.' })
  @Min(1, { message: 'شناسه رستوران معتبر نیست.' })
  restaurantId: number;
}

// ✅ Safer: restaurantId is immutable after creation
export class UpdateCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['restaurantId'] as const),
) {}
