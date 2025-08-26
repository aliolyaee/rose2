// resturants.controller.ts
import { Controller, Get, Param, Patch, Delete, ParseIntPipe, Body, Post } from '@nestjs/common';
import { ResturantsService } from './resturants.service';
import { CreateResturantDto, UpdateResturantDto } from './dto/create-resturant.dto';

@Controller('resturants')
export class ResturantsController {
  constructor(private readonly resturantsService: ResturantsService) {}

  @Post()
  create(@Body() dto: CreateResturantDto) {
    return this.resturantsService.create(dto);
  }

  @Get()
  findAll() {
    return this.resturantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resturantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResturantDto) {
    return this.resturantsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resturantsService.remove(id);
  }
}
