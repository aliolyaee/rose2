import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { ApiConsumes, ApiTags, ApiBody } from '@nestjs/swagger';
import { UploadFile } from '../../common/interceptors/upload.interceptor';
import { multerFile } from '../../common/utils/multer.util';
import { SwaggerConsumesEnum } from '../../common/enums/swagger-consumes.enum';
import { ImageDto } from './dto/create-image.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';

@Controller('image')
@ApiTags('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.JSON, SwaggerConsumesEnum.MULTIPART)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        alt: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['name', 'image'],
    },
  })
  @UseInterceptors(UploadFile('image'))
  async create(
    @Body() createImageDto: ImageDto,
    @UploadedFile() image: multerFile,
  ) {
    return await this.imageService.create(createImageDto, image);
  }

  @Get()
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  async findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.findOne(id);
  }

  @Patch(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumesEnum.JSON, SwaggerConsumesEnum.MULTIPART)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        alt: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(UploadFile('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImageDto: ImageDto,
    @UploadedFile() image: multerFile,
  ) {
    return this.imageService.update(id, updateImageDto, image);
  }

  @Delete(':id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.remove(id);
  }
}
