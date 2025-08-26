import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { TokensPayload } from './types/payload';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { LoginDto, SignupDto } from './dto/basic.dto';
import { Roles } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    let { username, password, fullname } = signupDto;
    password = await this.passwordMatch(password);
    let user = this.userRepository.create({
      username,
      password,
      fullName: fullname,
    });
    user = await this.userRepository.save(user);
    return {
      message: 'کاربر با موفقیت ایجاد شد',
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    let user = await this.userRepository.findOneBy({ username });
    if (!user)
      throw new UnauthorizedException(
        'کاربری با این اطلاعات یافت نشد.',
      );
    if (!user?.password)
      throw new UnauthorizedException('شما نمی‌توانید با رمز عبور وارد شوید!');
    if (!compareSync(password, user.password))
      throw new UnauthorizedException(
        'کاربری با این اطلاعات یافت نشد.',
      );
    user.lastLogin = new Date();
    await this.userRepository.save(user);
    const { accessToken, refreshToken } = await this.makeTokensOfUser({
      id: user?.id,
    });
    return {
      accessToken,
      refreshToken,
      message: 'ورود با موفقیت انجام شد!',
    };
  }
  async userLastLogin(id: number) {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user.lastLogin;
  }

  async passwordMatch(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  async makeTokensOfUser(payload: TokensPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESSTOKENJWT'),
      expiresIn: '30d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESHTOKENJWT'),
      expiresIn: '1y',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<TokensPayload>(token, {
        secret: this.configService.get<string>('ACCESSTOKENJWT'),
      });
      if (typeof payload === 'object' && payload?.id) {
        const user = await this.userRepository.findOne({
          where: { id: payload.id },
          select: ['id', 'username', 'fullName', 'role'],
        });
        if (!user) throw new UnauthorizedException('برای ورود ابتدا وارد حساب کاربری خود شوید');
        return user;
      }
      throw new UnauthorizedException('برای ورود ابتدا وارد حساب کاربری خود شوید');
    } catch (error) {
      throw new UnauthorizedException('برای ورود ابتدا وارد حساب کاربری خود شوید');
    }
  }

  async setUserRoleAdmin(id: number) {
    let user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    user.role = Roles.Admin;
    await this.userRepository.save(user);
    return {
      message: 'با موفقیت انجام شد',
    };
  }
}