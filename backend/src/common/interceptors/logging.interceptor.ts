import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { method, url, headers, params, query, body } = req;

    const safe = (obj: any) => {
      try { return JSON.stringify(obj); } catch { return '[unserializable]'; }
    };

    this.logger.debug(`--> ${method} ${url}`);
    this.logger.debug(`    params=${safe(params)} query=${safe(query)} body=${safe(body)} headers=${safe({
      authorization: headers.authorization, // avoid logging everything if you want
    })}`);

    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.debug(`<-- ${method} ${url} ${res.statusCode} ${ms}ms`);
      }),
    );
  }
}