import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function FilterBlog() {
  return applyDecorators(
    ApiQuery({
      name: 'category',
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