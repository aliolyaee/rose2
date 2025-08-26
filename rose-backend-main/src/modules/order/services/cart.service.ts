import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { MenuItem } from 'src/modules/menu/entities/menu-item.entity';
import { AddMultipleItemsDto } from '../dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,

    @InjectRepository(MenuItem)
    private itemRepo: Repository<MenuItem>,
  ) {}

  async addItem(sessionId: string, menuItemId: number, quantity: number = 1) {
    const menuItem = await this.itemRepo.findOne({ where: { id: menuItemId } });
    if (!menuItem) throw new NotFoundException('ایتم یافت نشد.');

    let cartItem = await this.cartRepo.findOne({
      where: { sessionId, menuItem, ordered: false },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartRepo.create({ sessionId, menuItem, quantity });
    }

    return this.cartRepo.save(cartItem);
  }
  async addMultipleItems(sessionId: string, dto: AddMultipleItemsDto) {
    const results: CartItem[] = [];
    for (const item of dto.items) {
      results.push(
        await this.addItem(sessionId, item.menuItemId, item.quantity),
      );
    }
    return results;
  }

  async getCart(sessionId: string) {
    return this.cartRepo.find({
      where: { sessionId, ordered: false },
      relations: ['menuItem'],
    });
  }

  async removeItem(id: number, sessionId: string) {
    const item = await this.cartRepo.findOne({
      where: { id, sessionId, ordered: false },
    });
    if (!item) throw new NotFoundException('آیتم سبد خرید یافت نشد.');
    return this.cartRepo.remove(item);
  }

  async clearCart(sessionId: string) {
    return this.cartRepo.delete({ sessionId, ordered: false });
  }
}
