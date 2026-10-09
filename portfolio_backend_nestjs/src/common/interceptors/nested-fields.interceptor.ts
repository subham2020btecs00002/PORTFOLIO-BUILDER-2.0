import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class NestedFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.body && typeof request.body === 'object') {
      const parsed = this.parseNestedFields(request.body);
      request.body = this.normalizeValues(parsed);
    }
    return next.handle();
  }

  private normalizeValues(data: any): any {
    if (data === null || data === undefined) return data;
    if (data === 'true') return true;
    if (data === 'false') return false;
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeValues(item));
    }
    if (typeof data === 'object') {
      const res: any = {};
      for (const k of Object.keys(data)) {
        res[k] = this.normalizeValues(data[k]);
      }
      return res;
    }
    return data;
  }

  private parseNestedFields(obj: any): any {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const parts = key.split(/[[\]]+/).filter(Boolean);

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
