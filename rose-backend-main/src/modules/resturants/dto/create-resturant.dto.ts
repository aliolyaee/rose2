import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

export class CreateResturantDto {
  @ApiProperty({
    description: 'Restaurant name',
    example: 'Pizza Palace',
    minLength: 1,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Short description/bio of the restaurant',
    example: 'Authentic Italian with wood-fired ovens',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Existing table IDs to attach to the restaurant',
    type: 'string',
    format: 'uuid',
    isArray: true,
    example: ['c42d6e7e-3b49-4f8e-9a3a-1a3b8b6d1a22', 'b5a9b0f1-76e2-4d28-9c33-0f5d3f7de111'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tableIds?: string[];
}
import { PartialType } from '@nestjs/mapped-types';

export class UpdateResturantDto extends PartialType(CreateResturantDto) {}
