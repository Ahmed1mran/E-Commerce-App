import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserDocument } from 'src/DB/model/User.model';

export const User = createParamDecorator<keyof UserDocument | undefined>(
  (data, ctx: ExecutionContext) => {
    const contextType = ctx.getType<'http' | 'graphql' | 'ws'>();

    let user: UserDocument | undefined;

    if (contextType === 'http') {
      const req = ctx.switchToHttp().getRequest<{ user?: UserDocument }>();
      user = req.user;
    } else if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx).getContext<{
        req: { user?: UserDocument };
      }>();
      user = gqlCtx.req.user;
    } else if (contextType === 'ws') {
      const client = ctx.switchToWs().getClient<{ user?: UserDocument }>();
      user = client.user;
    } else {
      throw new UnauthorizedException('Unknown context type');
    }

    if (!user) {
      throw new UnauthorizedException('User not found in context');
    }

    // لو data محدد، رجع الخاصية؛ وإلا رجع الكائن كامل
    return data ? (user as any)[data] : user;
  },
);
