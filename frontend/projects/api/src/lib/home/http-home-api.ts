import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Home } from './home';
import { HomeApi } from './home-api';
import { Nudge } from './nudge';

@Injectable()
export class HttpHomeApi implements HomeApi {
  private readonly http = inject(HttpClient);

  get(): Observable<Home> {
    return this.http.get<Home>('/api/home');
  }

  nudges(): Observable<Nudge[]> {
    return this.http.get<Nudge[]>('/api/home/nudges');
  }
}
