import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty()
  @IsInt({ message: 'شناسه آیتم منو باید عدد باشد.' })
  menuItemId: number;

  @ApiProperty()
  @IsInt({ message: 'تعداد باید عدد باشد.' })
  @Min(1, { message: 'تعداد باید حداقل ۱ باشد.' })
  quantity: number;
}

export class AddMultipleItemsDto {
  @ApiProperty({ type: [AddToCartDto] })
  @ValidateNested({
    each: true,
    message: 'آیتم‌ها باید به صورت صحیح وارد شوند.',
  })
  @Type(() => AddToCartDto)
  @ArrayMinSize(1, { message: 'حداقل یک آیتم باید انتخاب شود.' })
  items: AddToCartDto[];
}
