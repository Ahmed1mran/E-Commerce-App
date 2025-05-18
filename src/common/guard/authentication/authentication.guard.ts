// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { GqlExecutionContext } from '@nestjs/graphql';
// import { Request } from 'express';
// // import { Request } from 'express';
// import { Observable } from 'rxjs';
// import { TokenService } from 'src/common/service/token.service';
// import { UserDocument } from 'src/DB/model/User.model.js';

// export interface IAuthReq extends Request {
//   user: UserDocument;
// }

// @Injectable()
// export class AuthenticationGuard implements CanActivate {
//   constructor(private readonly tokenService: TokenService) {}
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     try {
//       let authorization: string | undefined;
//     let token: string | undefined;
//     let req: IAuthReq;
//       switch (context.getType() as string) {
//         case 'ws': {
//           authorization =
//             context.switchToWs().getClient().handshake?.headers
//               ?.authorization ||
//             context.switchToWs().getClient().handshake?.auth?.authorization;
//           console.log({ client: authorization });
//           context.switchToWs().getClient().user =
//             await this.tokenService.verify({
//               authorization,
//             });
//           // لو عندك توكن من ال client حطه هنا
//           break;
//         }
//         case 'http': {
//           const req = context.switchToHttp().getRequest<IAuthReq>();
//           authorization = req.headers.authorization;

//           if (!authorization) return false;

//           req.user = await this.tokenService.verify({ authorization });
//           break;
//         }

//         case 'graphql' : {
//           authorization =
//             GqlExecutionContext.create(context).getContext().req.headers
//               .authorization;
//           GqlExecutionContext.create(context).getContext().req.user =
//             await this.tokenService.verify({authorization})

//         //  console.log(ctx);
//           break;
//         }


//         default:
//           return false;
//       }
//   if (!authorization) return false;
//       console.log({ GUser: context.switchToHttp().getRequest().user });
//       return true;
//     } catch (error) {
//       console.error('Token verification failed:', error.message);
//       return false;
//     }
//   }
// }
///////////////////////////////////
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
