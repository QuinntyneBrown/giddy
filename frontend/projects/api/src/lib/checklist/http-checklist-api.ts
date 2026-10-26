import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Checklist } from './checklist';
import { ChecklistApi } from './checklist-api';
import { ChecklistTask } from './checklist-task';
import { GiddyDidTask } from './giddy-did-task';
import { TaskInput } from './task-input';

@Injectable()
export class HttpChecklistApi implements ChecklistApi {
  private readonly http = inject(HttpClient);

  get(partyId: string): Observable<Checklist> {
    return this.http.get<Checklist>(`/api/parties/${partyId}/tasks`);
  }

  add(partyId: string, task: TaskInput): Observable<ChecklistTask> {
    return this.http.post<ChecklistTask>(`/api/parties/${partyId}/tasks`, task);
  }

  change(partyId: string, taskId: string, task: TaskInput): Observable<ChecklistTask> {
    return this.http.put<ChecklistTask>(`/api/parties/${partyId}/tasks/${taskId}`, task);
  }

  remove(partyId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`/api/parties/${partyId}/tasks/${taskId}`);
  }

  setDone(
    partyId: string,
    taskId: string,
    done: boolean,
    version?: string,
  ): Observable<ChecklistTask> {
    return this.http.put<ChecklistTask>(
      `/api/parties/${partyId}/tasks/${taskId}/done`,
      { done },
      version ? { headers: { 'If-Match': `"${version}"` } } : {},
    );
  }

  letGiddyDo(partyId: string, taskId: string): Observable<GiddyDidTask> {
    return this.http.post<GiddyDidTask>(`/api/parties/${partyId}/tasks/${taskId}/giddy`, {});
  }

  generate(partyId: string): Observable<Checklist> {
    return this.http.post<Checklist>(`/api/parties/${partyId}/tasks/generate`, {});
  }
}
