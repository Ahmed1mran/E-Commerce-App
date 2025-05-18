import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { rolesKey } from 'src/common/decorators/roles.decorator';
import { RoleTypes, UserDocument } from 'src/DB/model/User.model';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // استدعاء ال roles المطلوبة من الديكوريتر
    const requiredRoles = this.reflector.getAllAndOverride<RoleTypes[]>(
      rolesKey,
      [context.getHandler(), context.getClass()],
    );

    // لو مفيش roles محددة، ندي صلاحية المرور
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    let user: UserDocument;
    const contextType = context.getType<'http' | 'ws' | 'graphql'>();

    // WebSocket
    if (contextType === 'ws') {
      const client = context.switchToWs().getClient();
      user = client.user as UserDocument;
    }
    // HTTP
    else if (contextType === 'http') {
      const req = context.switchToHttp().getRequest<{ user: UserDocument }>();
      user = req.user;
    }
    // GraphQL
    else if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext();
      user = gqlCtx.req.user as UserDocument;
    }
    // نوع غير معروف
    else {
      throw new ForbiddenException('Unknown context type');
    }

    // تحقق من المستخدم والصلاحيات
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Not Authorized Account');
    }

    return true;
  }
}
