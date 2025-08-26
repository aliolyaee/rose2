import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './dto/create-table.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from '../../common/enums/swagger-consumes.enum';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  async findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.update(id, dto);
  }

  @Delete(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.remove(id);
  }
}
