import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction, Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { isJWT } from 'class-validator';

@Injectable()
export class AddUserToRequestMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    if (!token) return next();

    try {
      const user = await this.authService.validateAccessToken(token);
      if (user) req.user = user; // Attach the user to the request
    } catch (error) {
      console.error(error);
    }

    next();
  }

  protected extractToken(request: Request): string | null {
    const authorization = request?.headers?.authorization;
    if (!authorization || authorization.trim() === '') {
      return null;
    }

    const [bearer, token] = authorization.split(' ');
    if (bearer?.toLowerCase() !== 'bearer' || !token || !isJWT(token)) {
      return null;
    }

    return token;
  }
}
