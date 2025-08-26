import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      sessionId = randomUUID();
      res.setHeader('x-session-id', sessionId);
    }

    req.sessionId = sessionId;
    next();
  }
}
