import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateTableDto {
  @ApiProperty()
  @IsString({ message: 'نام باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن نام الزامی است.' })
  name: string;

  @ApiProperty()
  @IsString({ message: 'توضیحات باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن توضیحات الزامی است.' })
  description: string;

  @ApiProperty()
  @IsNumber({}, { message: 'ظرفیت باید یک عدد باشد.' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'وارد کردن ظرفیت الزامی است.' })
  @Min(1, { message: 'ظرفیت باید حداقل ۱ باشد.' })
  @Max(20, { message: 'ظرفیت نمی‌تواند بیشتر از ۲۰ باشد.' })
  capacity: number;

  @ApiProperty()
  @IsString({ message: 'عکس باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'وارد کردن عکس الزامی است.' })
  photo: string;
}
export class UpdateTableDto extends PartialType(CreateTableDto) {}
