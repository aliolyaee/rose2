import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AuthGuard, RoleGuard],
  exports: [AuthService, AuthGuard, RoleGuard],
})
export class AuthModule {}
