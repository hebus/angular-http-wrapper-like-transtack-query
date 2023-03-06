import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { query } from './types';
import { map } from 'rxjs';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <h1>Hello from {{name}}!</h1>
    <a target="_blank" href="https://angular.io/start">
      Learn more about Angular 
    </a>
    <ul>
      <li>Status: {{ org.status$ | async }}</li>
      <li>Error: {{ org.error$ | async | json }}</li>
      <li>
        <details>
          <summary>Data</summary>
          {{ org.data$ | async | json }}
        </details>
      </li>
    </ul>
    <button (click)="org.invalidate()">Refresh</button>
    <div *ngFor="let poke of org.data$ | async">
      <h2>{{ poke.name }}</h2>
      <a [href]="poke.url">{{ poke.url }}</a>
    </div>
  `,
})
export class App {
  name = 'Angular';

  org = query(() =>
    this.http.get<any>(
      'https://pokeapi.co/api/v2/pokemon'
    ).pipe(map(resp => resp.results))
  );

  constructor(private http: HttpClient) {}
}

bootstrapApplication(App);
