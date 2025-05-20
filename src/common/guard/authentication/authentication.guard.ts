import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { TokenService } from 'src/common/service/token.service';
import { UserDocument } from 'src/DB/model/User.model.js';

export interface IAuthReq extends Request {
  user: UserDocument;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextType = context.getType<'http' | 'ws' | 'graphql'>();

    // WebSocket: معالجة خاصة ثم خروج مباشر
    if (contextType === 'ws') {
      const client = context.switchToWs().getClient();
      const authorization =
        client.handshake?.headers?.authorization ||
        client.handshake?.auth?.authorization;

      if (!authorization)
        throw new ForbiddenException('No Authorization header');

      client.user = await this.tokenService.verify({ authorization });
      return true;
    }

    // باقي الأنواع: GraphQL أو HTTP
    let req: IAuthReq;
    if (contextType === 'http') {
      req = context.switchToHttp().getRequest<IAuthReq>();
    } else if (contextType === 'graphql') {
      req = GqlExecutionContext.create(context).getContext().req as IAuthReq;
    } else {
      throw new ForbiddenException('Unknown context type');
    }

    const authorization = req.headers.authorization;
    if (!authorization) throw new ForbiddenException('No Authorization header');

    req.user = await this.tokenService.verify({ authorization });
    return true;
  }
}

///////////////////////////////////////////

// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   ForbiddenException,
// } from '@nestjs/common';
// import { GqlExecutionContext } from '@nestjs/graphql';
// import { Request } from 'express';
// import { TokenService } from 'src/common/service/token.service';
// import { UserDocument } from 'src/DB/model/User.model.js';

// export interface IAuthReq extends Request {
//   user: UserDocument;
// }

// @Injectable()
// export class AuthenticationGuard implements CanActivate {
//   constructor(private readonly tokenService: TokenService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     let authHeader: string | undefined;
//     let req: IAuthReq;

//     const type = context.getType<'http' | 'ws' | string>();

//     if (type === 'ws') {
//       const client = context.switchToWs().getClient();
//       authHeader =
//         client.handshake?.headers?.authorization ||
//         client.handshake?.auth?.authorization;
//       if (!authHeader) throw new ForbiddenException('No Authorization header');
//       // مرِّر الهيدر كامل: "Bearer xyz..."
//       client.user = await this.tokenService.verify({
//         authorization: authHeader,
//       });
//       return true;
//     }

//     if (type === 'http') {
//       req = context.switchToHttp().getRequest<IAuthReq>();
//     } else {
//       const gqlCtx = GqlExecutionContext.create(context).getContext();
//       req = gqlCtx.req as IAuthReq;
//     }

//     authHeader = req.headers.authorization as string;
//     if (!authHeader) throw new ForbiddenException('No Authorization header');

//     try {
//       // مرِّر الهيدر كامل: "Bearer xyz..."
//       req.user = await this.tokenService.verify({ authorization: authHeader });
//       return true;
//     } catch (err) {
//       throw new ForbiddenException('Token verification failed');
//     }
//   }
// }
