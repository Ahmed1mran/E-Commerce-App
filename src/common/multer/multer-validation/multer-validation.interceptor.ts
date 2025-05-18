import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MulterValidationInterceptor implements NestInterceptor {
  // constructor(@Inject(CHECK_REQUIRED) private readonly checkRequired: boolean) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    console.log({ fff: req.file });
  // if (this.checkRequired) {
        if (!req.file) {
          throw new BadRequestException('Missing file');
        }
  // }
    return next.handle();
  }
}
