import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/create-item.dto';
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  ParseIntPipe,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';
import { ApiConsumes, ApiQuery } from '@nestjs/swagger';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/create-category.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';
import { FilterItemsDto } from './dto/filter-items.dto';
import { FilterItems } from 'src/common/decorators/filter.decorator';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // --- MENU ITEM ENDPOINTS ---

  @Post('items')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async createMenuItem(@Body() dto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(dto);
  }

  @Get('items')
  @FilterItems()
  @ApiQuery({ name: 'restaurantId', required: false, type: Number })
  async getMenuItems(
    @Query() filterDto: FilterItemsDto,
    @Query('restaurantId') restaurantId?: number,
  ) {
    return this.menuService.getMenuItems(
      filterDto,
      restaurantId ? +restaurantId : undefined,
    );
  }

  @Get('items/:id')
  async findMenuItemById(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findMenuItemById(id);
  }

  @Patch('items/:id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async updateMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateMenuItem(id, dto);
  }

  @Delete('items/:id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async removeMenuItem(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.removeMenuItem(id);
  }

  // --- CATEGORY ENDPOINTS ---

  @Post('categories')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(dto);
  }

  @Get('categories')
  @ApiQuery({ name: 'restaurantId', required: true, type: Number })
  async getAllCategories(@Query('restaurantId') restaurantId?: number) {
    return this.menuService.getAllCategories(
      restaurantId ? +restaurantId : undefined,
    );
  }

  @Get('categories/:id')
  async findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findCategoryById(id);
  }

  @Patch('categories/:id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.removeCategory(id);
  }

  @Get('items/category/:id')
  async getItemsByCategoryId(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getItemsByCategoryId(id);
  }
}
