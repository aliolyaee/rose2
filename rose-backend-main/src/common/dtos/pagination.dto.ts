import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ type: 'integer', required: false})
  page: number;
  @ApiPropertyOptional({ type: 'integer', required: false})
  limit: number;
}