import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent, authInterceptor } from './app/app';
bootstrapApplication(AppComponent,{providers:[provideIonicAngular(),provideHttpClient(withInterceptors([authInterceptor]))]}).catch(console.error);
