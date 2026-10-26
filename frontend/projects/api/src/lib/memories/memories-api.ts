import { Observable } from 'rxjs';
import { Memory } from '../conversations/memory';

export interface MemoriesApi {
  list(): Observable<Memory[]>;
  forget(memoryId: string): Observable<void>;
}
