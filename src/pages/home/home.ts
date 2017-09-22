import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from "rxjs";
import { Storage } from '@ionic/storage';

declare var google; 

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  isAlarmOn : boolean;
  public interval;
  public subscription;
  public alert;
  alertClosed = true; 
  map : any;

  @ViewChild('map') mapElement;

  constructor(public navCtrl: NavController, 
    public alertCtrl: AlertController, 
    public http: Http,
    public storage: Storage){
      this.isAlarmOn = false;
      this.readFromStorageAlarmStatus(); 
   
  }

  ionViewDidLoad(){
    this.getLastGpsPosition();
  }

  getLastGpsPosition(){
    let url = "/proxy-antea25/loc/getgpsdata/a17767b1-820f-4f0b-948b-acd9cd1a242a";
    this.http.get(url).subscribe(data => {
      if(data.json().length > 0){
        console.log(data.json()[data.json().length-1])
        this.initMap(data.json()[data.json().length-1].gpsPositionLatitude, data.json()[data.json().length-1].gpsPositionLongitude)
      }
      else{
        this.initMap(55, -1.5);
      }
    },err => this.initMap(55, -1.5));
  }

  showLastPosition(){
    this.getLastGpsPosition();
  }

  initMap(lat, lng){
    let latLog = new google.maps.LatLng(lat, lng); 

    let mapOptions = {
      center: latLog,
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: true
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    let marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      position: latLog
    });
  }

  alarmSwitcher(event){
    debugger;
    if(event.checked){
      this.saveInStorageAlarmStatus();
      this.interval = Observable.timer(300,15000);
      this.subscription = this.interval.subscribe(t=>{
        let url = "/proxy-antea25/loc/getMotion/a17767b1-820f-4f0b-948b-acd9cd1a242a/" + this.getCurrentDate();
        this.http.get(url).subscribe(p => {
          
          //as it is asynchrone if user stop alarm
          if(event.checked){ 
              if(p.json() == true && this.alertClosed)
              {
                this.alertClosed = false;
                this.alert = this.alertCtrl.create({
                      title: 'Antea25 ALARM!',
                      subTitle: 'Something is happening!',
                      buttons: [{
                        text: 'OK',
                        role: 'cancel',
                        handler: () => {
                          this.alertClosed = true;  
                        }
                        }]
                });
                this.alert.present();  
              }
          }
          console.log(p.json());
        });
      });
    }
    //Unsubscribe timer
    if(!event.checked){
      this.subscription.unsubscribe();
      this.saveInStorageAlarmStatus();
    }
  }

  getCurrentDate() : string{
    let currentDate = new Date();
    return new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('.')[0];
  }

  saveInStorageAlarmStatus() {
    this.storage.set('AlarmStatus', this.isAlarmOn);
  }
  
  readFromStorageAlarmStatus() {
    this.storage.get('AlarmStatus').then((value) => {
      value ? this.isAlarmOn = true : this.isAlarmOn = false
    }).catch(() => this.isAlarmOn = false);
  }
}
