import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function FilterTables() {
  return applyDecorators(
    ApiQuery({
      name: 'category',
      example: 'string',
      required: false,
      type: 'string',
    }),
    ApiQuery({
      name: 'reservationTime',
      example: 'string',
      required: false,
      type: 'string',
    }),
    ApiQuery({
      name: 'reservationDate',
      example: 'string',
      required: false,
      type: 'string',
    }),
    ApiQuery({
      name: 'search',
      example: 'string',
      required: false,
      type: 'string',
    }),
  );
}
export function FilterItems() {
  return applyDecorators(
    ApiQuery({
      name: 'category',
      example: '1',
      required: false,
      type: 'number',
    }),
    ApiQuery({
      name: 'search',
      example: 'string',
      required: false,
      type: 'string',
    }),
  );
}
