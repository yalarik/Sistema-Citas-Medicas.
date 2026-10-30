import { Component } from '@angular/core';
import { AppComponent } from '../../app';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [AppComponent],
  template: `<app-root></app-root>`
})
export class AdminPageComponent {}
