import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { IonApp,IonContent,IonHeader,IonTitle,IonToolbar,IonButton,IonInput,IonItem,IonLabel,IonSelect,IonSelectOption,IonList,IonCard,IonCardContent } from '@ionic/angular/standalone';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
const API='http://192.168.1.11:8080/api/v1';
let token='';
export const authInterceptor:HttpInterceptorFn=(req,next)=>next(token?req.clone({setHeaders:{Authorization:'Bearer '+token}}):req);
@Component({selector:'app-root',standalone:true,imports:[CommonModule,FormsModule,IonApp,IonContent,IonHeader,IonTitle,IonToolbar,IonButton,IonInput,IonItem,IonLabel,IonSelect,IonSelectOption,IonList,IonCard,IonCardContent],template:`
<ion-app><ion-header><ion-toolbar><ion-title>Citas médicas</ion-title></ion-toolbar></ion-header><ion-content class="ion-padding">
<p *ngIf="!online">Sin conexión a Internet</p><p>{{mensaje}}</p>
<div *ngIf="!token"><ion-item><ion-input label="Correo" labelPlacement="stacked" [(ngModel)]="correo"></ion-input></ion-item><ion-item><ion-input label="Contraseña" labelPlacement="stacked" type="password" [(ngModel)]="password"></ion-input></ion-item><ion-button (click)="login()">Entrar</ion-button></div>
<div *ngIf="token"><ion-button (click)="salir()">Salir</ion-button><h2>Reservar cita</h2><ion-item><ion-select label="Médico" [(ngModel)]="doctorId" (ionChange)="horarios()"><ion-select-option *ngFor="let d of doctores" [value]="d.id">{{d.usuario?.nombre}} - {{d.especialidad?.nombre}}</ion-select-option></ion-select></ion-item><ion-item><ion-input label="Fecha" type="date" [(ngModel)]="fecha" (ionChange)="horarios()"></ion-input></ion-item><ion-item><ion-select label="Horario" [(ngModel)]="hora"><ion-select-option *ngFor="let h of disponibles" [value]="h.horaInicio">{{h.horaInicio}}</ion-select-option></ion-select></ion-item><ion-item><ion-input label="Motivo" [(ngModel)]="motivo"></ion-input></ion-item><ion-button (click)="reservar()">Reservar</ion-button><h2>Mis citas</h2><ion-button (click)="historial()">Actualizar</ion-button><ion-card *ngFor="let c of citas"><ion-card-content>{{c.fecha}} {{c.hora}} - {{c.estado}}<p>{{c.motivo}}</p><p>{{c.diagnostico}}</p><p>{{c.receta}}</p><ion-button *ngIf="c.estado==='PENDIENTE'" (click)="cancelar(c.id)">Cancelar</ion-button></ion-card-content></ion-card></div>
</ion-content></ion-app>`})
export class AppComponent{
 private http=inject(HttpClient);correo='';password='';token='';online=true;mensaje='';doctorId?:number;fecha=new Date().toISOString().substring(0,10);hora='';motivo='';doctores:any[]=[];disponibles:any[]=[];citas:any[]=[];
 constructor(){Network.getStatus().then(s=>this.online=s.connected);Network.addListener('networkStatusChange',s=>this.online=s.connected);Preferences.get({key:'token'}).then(r=>{if(r.value){token=r.value;this.token=r.value;this.iniciar()}})}
 login(){this.http.post<any>(API+'/auth/login',{correo:this.correo,password:this.password}).subscribe({next:async r=>{if(r.rol!=='ROLE_PATIENT'){this.mensaje='Esta aplicación es para pacientes';return}token=r.token;this.token=token;await Preferences.set({key:'token',value:token});this.mensaje='';this.iniciar()},error:()=>this.mensaje='Credenciales inválidas o servidor no disponible'})}
 iniciar(){this.http.get<any[]>(API+'/doctors').subscribe({next:x=>this.doctores=x,error:()=>this.mensaje='Error cargando médicos'});this.historial()}
 horarios(){if(!this.doctorId||!this.fecha)return;this.http.get<any[]>(API+'/schedules/available',{params:{doctorId:this.doctorId,fecha:this.fecha}}).subscribe({next:x=>this.disponibles=x,error:()=>this.mensaje='No se pudieron consultar horarios'})}
 reservar(){if(!this.doctorId||!this.hora||!this.motivo){this.mensaje='Complete los datos';return}this.http.post(API+'/appointments?doctorId='+this.doctorId,{fecha:this.fecha,hora:this.hora,motivo:this.motivo}).subscribe({next:()=>{this.mensaje='Cita reservada';this.historial();this.horarios()},error:()=>this.mensaje='No se pudo reservar'})}
 historial(){this.http.get<any[]>(API+'/appointments/my-history').subscribe({next:r=>this.citas=r,error:()=>this.mensaje='No se cargó el historial'})}
 cancelar(id:number){this.http.put(API+'/appointments/'+id+'/cancel',{}).subscribe({next:()=>this.historial(),error:()=>this.mensaje='No se pudo cancelar'})}
 async salir(){token='';this.token='';this.citas=[];await Preferences.remove({key:'token'})}
}
