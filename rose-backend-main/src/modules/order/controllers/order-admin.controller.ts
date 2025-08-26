import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';

@Controller('admin/orders')
export class OrderAdminController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async findAll(@Query('phone') phone?: string) {
    if (phone) {
      return this.orderService.getOrdersByPhone(phone);
    }
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.orderService.getOrderById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  @Delete(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.deleteOrder(id);
  }
}
