import { UserEntity } from 'src/modules/user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
    }
    export interface Request {
      sessionId: string;
    }
  }
}
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserEntity;
  }
}
