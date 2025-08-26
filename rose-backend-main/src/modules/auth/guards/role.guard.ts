import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../../../common/decorators/role.decorator';
import { Roles } from '../../../common/enums/role.enum';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    let requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length == 0) return true;
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    const request: Request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const userRole = user?.role;
    if (user?.role === Roles.Admin) return true;
    if (requiredRoles.includes(userRole as Roles)) return true;
    throw new ForbiddenException();
  }
}
