import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-item.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { ItemCategory } from './entities/item-category.entity';
import { REQUEST } from '@nestjs/core';
import { CustomRequest } from 'src/common/types/custom-req';
import { FilterItemsDto } from './dto/filter-items.dto';

@Injectable({ scope: Scope.REQUEST })
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(ItemCategory)
    private readonly categoryRepository: Repository<ItemCategory>,
    @Inject(REQUEST) private readonly request: CustomRequest,
  ) {}

  // ---------- ITEMS ----------

  async createMenuItem(createMenuItemDto: CreateMenuItemDto) {
    const { categoryId, ...menuItemData } = createMenuItemDto;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }

    const menuItem = this.menuItemRepository.create({
      ...menuItemData,
      category, // ties to restaurant via category.restaurantId
    });

    return this.menuItemRepository.save(menuItem);
  }

  async getMenuItems(filterDto: FilterItemsDto, restaurantId?: number) {
    let { category, search } = filterDto;
    let where = '';
    const parameters: Record<string, unknown> = {};

    if (category) {
      if (where) where += ' AND ';
      where += 'category.id = :category';
      parameters.category = category;
    }

    if (typeof restaurantId === 'number') {
      if (where) where += ' AND ';
      // category.restaurantId is a real column on ItemCategory
      where += 'category.restaurantId = :restaurantId';
      parameters.restaurantId = restaurantId;
    }

    if (search) {
      if (where) where += ' AND ';
      search = `%${search.toLowerCase()}%`;
      where +=
        '(LOWER(menuItem.title) LIKE :search OR LOWER(menuItem.description) LIKE :search)';
      parameters.search = search;
    }

    const query = this.menuItemRepository
      .createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.category', 'category');

    if (where) query.where(where, parameters);

    query.orderBy('category.id', 'ASC');

    return query.getMany();
  }

  async findMenuItemById(id: number) {
    const item = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!item) throw new NotFoundException('آیتم منو پیدا نشد.');
    return item;
  }

  async updateMenuItem(id: number, updateDto: Partial<CreateMenuItemDto>) {
    const menuItem = await this.menuItemRepository.findOneBy({ id });
    if (!menuItem) throw new NotFoundException('آیتم منو پیدا نشد.');

    if (updateDto.categoryId) {
      const category = await this.categoryRepository.findOneBy({
        id: updateDto.categoryId,
      });
      if (!category) throw new NotFoundException('دسته‌بندی پیدا نشد.');
      menuItem.category = category;
    }

    Object.assign(menuItem, updateDto);
    return this.menuItemRepository.save(menuItem);
  }

  async removeMenuItem(id: number) {
    const menuItem = await this.menuItemRepository.findOneBy({ id });
    if (!menuItem) throw new NotFoundException('آیتم منو پیدا نشد.');
    await this.menuItemRepository.delete(id);
    return { message: 'آیتم منو با موفقیت حذف شد.' };
  }

  // ---------- CATEGORIES ----------

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const user = this.request?.user;
    const restaurantId =
      createCategoryDto.restaurantId ?? (user && (user as any).restaurantId); // fallback if you carry it in token

    if (!restaurantId) {
      throw new BadRequestException('شناسه رستوران الزامی است.');
    }

    const { name, icon } = createCategoryDto;

    // unique per restaurant
    const existing = await this.categoryRepository.findOne({
      where: { name, restaurantId },
    });
    if (existing) {
      throw new BadRequestException(
        'این دسته‌بندی برای این رستوران موجود است.',
      );
    }

    const category = this.categoryRepository.create({
      name,
      icon,
      restaurantId,
    });

    return this.categoryRepository.save(category);
  }

  async getAllCategories(restaurantId?: number) {
    if (typeof restaurantId === 'number') {
      return this.categoryRepository.find({
        where: { restaurantId },
        order: { id: 'ASC' },
      });
    }
    return this.categoryRepository.find({ order: { id: 'ASC' } });
  }

  async findCategoryById(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('دسته‌بندی پیدا نشد.');
    return category;
  }

  async updateCategory(id: number, updateDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('دسته‌بندی پیدا نشد.');

    // Prevent restaurantId change (UpdateCategoryDto omits it)
    if ((updateDto as any).restaurantId !== undefined) {
      throw new BadRequestException('تغییر رستوران مجاز نیست.');
    }

    // Enforce unique name per restaurant if name changes
    if (updateDto.name && updateDto.name !== category.name) {
      const conflict = await this.categoryRepository.findOne({
        where: {
          name: updateDto.name,
          restaurantId: category.restaurantId,
          id: Not(id),
        } as any,
      });
      if (conflict) {
        throw new BadRequestException(
          'این نام برای این رستوران قبلاً استفاده شده است.',
        );
      }
    }

    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('دسته‌بندی پیدا نشد.');
    await this.categoryRepository.delete(id);
    return { message: 'دسته‌بندی با موفقیت حذف شد.' };
  }

  // ---------- Items by Category ----------

  async getItemsByCategoryId(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد.');

    const items = await this.menuItemRepository.find({
      where: { category: { id } },
      relations: ['category'],
    });

    return {
      categoryName: category.name,
      restaurantId: category.restaurantId,
      items,
    };
  }
}
