import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { ConfirmedPassword } from 'src/common/decorators/password.decorator';

export class SignupDto {
  @ApiProperty()
  @IsString({ message: 'نام باید یک رشته باشد.' })
  fullname: string;

  @ApiProperty()
  @IsString({ message: 'نام کاربری باید یک رشته باشد.' })
  @IsNotEmpty({ message: 'نام کاربری الزامی است.' })
  username: string;

  @ApiProperty()
  @IsString({ message: 'رمز عبور باید یک رشته باشد.' })
  @Length(8, 20, { message: 'رمز عبور باید بین ۸ تا ۲۰ کاراکتر باشد.' })
  password: string;

  @ApiProperty()
  @ConfirmedPassword('password')
  confirm_password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsString({ message: 'نام کاربری باید یک رشته باشد.' })
  username: string;

  @ApiProperty()
  @IsString({ message: 'رمز عبور باید یک رشته باشد.' })
  password: string;
}