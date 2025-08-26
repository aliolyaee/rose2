import { Body, Controller, Get, Post, Req, Query } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { PlaceOrderDto } from '../dto/place-order.dto';
import { Request } from 'express';
import { ApiConsumes, ApiHeader } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('place')
  @ApiHeader({
    name: 'x-session-id',
    required: true,
    description: 'Session ID for the cart',
  })
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async placeOrder(@Req() req: Request, @Body() dto: PlaceOrderDto) {
    const sessionId = req.sessionId;
    return this.orderService.placeOrder(
      sessionId,
      dto.customerName,
      dto.phoneNumber,
      dto.description,
      dto.tableId,
    );
  }

  @Get()
  async getOrders(@Query('phone') phone: string) {
    return this.orderService.getOrdersByPhone(phone);
  }
}
