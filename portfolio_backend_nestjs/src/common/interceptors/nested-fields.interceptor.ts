import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class NestedFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.body && typeof request.body === 'object') {
      request.body = this.parseNestedFields(request.body);
    }
    return next.handle();
  }

  private parseNestedFields(obj: any): any {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const parts = key.split(/[\[\]]+/).filter(Boolean);
        
        let current = result;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const nextPart = parts[i + 1];
          
          if (nextPart !== undefined) {
            const isNextNumber = !isNaN(Number(nextPart));
            if (!current[part]) {
              current[part] = isNextNumber ? [] : {};
            }
            current = current[part];
          } else {
            if (value === 'true') {
              current[part] = true;
            } else if (value === 'false') {
              current[part] = false;
            } else {
              current[part] = value;
            }
          }
        }
      }
    }
    return result;
  }
}
