import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Conversation } from './conversation';
import { ConversationsApi } from './conversations-api';
import { MessageAccepted } from './message-accepted';
import { Turn } from './turn';

@Injectable()
export class HttpConversationsApi implements ConversationsApi {
  private readonly http = inject(HttpClient);

  current(): Observable<Conversation> {
    return this.http.get<Conversation>('/api/conversations/current');
  }

  start(): Observable<Conversation> {
    return this.http.post<Conversation>('/api/conversations', {});
  }

  send(conversationId: string, text: string): Observable<MessageAccepted> {
    return this.http.post<MessageAccepted>(`/api/conversations/${conversationId}/messages`, {
      text,
    });
  }

  turn(conversationId: string, turnId: string, after: number): Observable<Turn> {
    return this.http.get<Turn>(`/api/conversations/${conversationId}/turns/${turnId}`, {
      params: { after },
    });
  }

  cancel(conversationId: string, turnId: string): Observable<void> {
    return this.http
      .post(`/api/conversations/${conversationId}/turns/${turnId}/cancel`, {})
      .pipe(map(() => undefined));
  }
}
