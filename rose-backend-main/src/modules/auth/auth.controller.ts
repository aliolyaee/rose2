import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/basic.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';
import { Request } from 'express';

@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Post('/login')
  @ApiConsumes(SwaggerConsumesEnum.FORM, SwaggerConsumesEnum.JSON)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('/set-admin/:id')
  @AuthDecorator()
  @CanAccess(Roles.Admin)
  async setUserAdmin(@Query('id', ParseIntPipe) id: number) {
    return await this.authService.setUserRoleAdmin(id);
  }

  @Get('/last-login')
  @AuthDecorator()
  async lastLoginDate(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in request.');
    }
    const userLastLogin = await this.authService.userLastLogin(userId);
    return {
      lastLogin: userLastLogin,
    };
  }
}