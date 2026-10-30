import { Component } from '@angular/core';
import { AppComponent } from '../../app';

@Component({
  selector: 'app-doctor-page',
  standalone: true,
  imports: [AppComponent],
  template: `<app-root></app-root>`
})
export class DoctorPageComponent {}
