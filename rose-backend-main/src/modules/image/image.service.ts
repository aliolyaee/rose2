import { Injectable, Inject, Scope, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageEntity } from './entities/image.entity';
import { multerFile } from '../../common/utils/multer.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PublicMessage } from '../../common/enums/message.enum';
import { ImageDto } from './dto/create-image.dto';

@Injectable({ scope: Scope.REQUEST })
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private req: Request,
  ) {}

  async create(createImageDto: ImageDto, image: multerFile) {
    const { name, alt } = createImageDto;
    const location = image?.path?.startsWith('public/')
      ? image.path.slice(7)
      : image?.path;

    const entity = this.imageRepository.create({
      name,
      alt: alt || name,
      location,
    });
    await this.imageRepository.save(entity);

    return {
      message: PublicMessage.Created,
      data: {
        name: entity.name,
        alt: entity.alt,
        location: entity.location,
      },
    };
  }

  async findAll() {
    const images = await this.imageRepository.find();
    return {
      message: PublicMessage.Success,
      data: images,
    };
  }

  async findOne(id: number) {
    const image = await this.imageRepository.findOneBy({ id });
    if (!image) throw new NotFoundException('Image not found');
    return {
      message: PublicMessage.Success,
      data: image,
    };
  }

  async update(id: number, updateImageDto: ImageDto, image: multerFile) {
    const entity = await this.imageRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException('Image not found');

    if (updateImageDto.name) entity.name = updateImageDto.name;
    if (updateImageDto.alt) entity.alt = updateImageDto.alt;
    if (image?.path) {
      entity.location = image.path.startsWith('public/')
        ? image.path.slice(7)
        : image.path;
    }

    await this.imageRepository.save(entity);

    return {
      message: PublicMessage.Updated,
      data: entity,
    };
  }

  async remove(id: number) {
    const entity = await this.imageRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException('Image not found');
    await this.imageRepository.delete(id);
    return {
      message: PublicMessage.Deleted,
    };
  }
}
