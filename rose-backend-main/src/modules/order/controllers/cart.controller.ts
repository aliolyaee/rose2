import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiConsumes, ApiHeader } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { AddMultipleItemsDto, AddToCartDto } from '../dto/add-to-cart.dto';
import { Request } from 'express';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @ApiHeader({
    name: 'x-session-id',
    required: true,
    description: 'Session ID for the cart',
  })
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async addItem(@Req() req: Request, @Body() dto: AddToCartDto) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.addItem(sessionId, dto.menuItemId, dto.quantity);
  }

  @Post('add-multiple')
  @ApiHeader({
    name: 'x-session-id',
    required: true,
    description: 'Session ID for the cart',
  })
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async addMultiple(@Req() req: Request, @Body() dto: AddMultipleItemsDto) {
    const sessionId = req.headers['x-session-id'] as string;

    return this.cartService.addMultipleItems(sessionId, dto);
  }

  @Get()
  @ApiHeader({
    name: 'x-session-id',
    required: true,
    description: 'Session ID for the cart',
  })
  async getCart(@Req() req: Request) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.getCart(sessionId);
  }

  @Delete('remove/:id')
  @ApiHeader({
    name: 'x-session-id',
    required: true,
    description: 'Session ID for the cart',
  })
  async removeItem(@Req() req: Request, @Param('id') id: number) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.removeItem(id, sessionId);
  }

  @Delete('clear')
  @ApiHeader({
    name: 'x-session-id',
    required: true,
    description: 'Session ID for the cart',
  })
  async clearCart(@Req() req: Request) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.clearCart(sessionId);
  }
}
