import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ImageDto {
  @ApiProperty({ format: 'binary' })
  @IsString({ message: 'تصویر باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'تصویر الزامی است.' })
  image: string;

  @ApiPropertyOptional()
  @IsString({ message: 'متن جایگزین باید یک رشته باشد.' })
  alt: string;

  @ApiProperty()
  @IsString({ message: 'نام باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'نام الزامی است.' })
  name: string;
}