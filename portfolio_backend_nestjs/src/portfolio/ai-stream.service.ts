import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class AiStreamService {
  private readonly stream$ = new Subject<any>();

  emit(userId: string, data: any) {
    this.stream$.next({ userId, ...data });
  }

  getStream() {
    return this.stream$.asObservable();
  }
}
