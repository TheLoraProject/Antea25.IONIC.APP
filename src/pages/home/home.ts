import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from "rxjs";
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';

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
  private isAndroid : boolean;
  alertClosed = true;
  map : any;

  @ViewChild('map') mapElement;

  constructor(public navCtrl: NavController, 
    public alertCtrl: AlertController, 
    public http: Http,
    public storage: Storage,
    private platform: Platform, 
    private localNotifications: LocalNotifications)
    {
      //detect platform
      this.isAndroid = !this.platform.is('ios');
      this.isAlarmOn = false;

      //Callback function if push notification
      this.platform.ready().then(rdy=>{
          this.localNotifications.on('click', (notification, state)=>{
            this.alertClosed = false;
            this.alert = this.alertCtrl.create({
              title: 'Antea25 ALARM!',
              subTitle: 'Something is happening!',
              buttons: [{text: 'OK', role: 'cancel',
                handler: () => {
                  this.alertClosed = true;  
                }
              }]
        });
        this.alert.present(); 
      })
    });
  }

  ionViewDidLoad(){
    this.readFromStorageAlarmStatus(); 
    this.getLastGpsPosition();
  }

  getLastGpsPosition(){
    let urlBase = !document.URL.startsWith('http') ? "http://dspx.eu/antea25" : "";
    let url = urlBase + "/api/loc/getgps/0004A30B00201302";
    this.http.get(url).subscribe(data => {
      if(data.json().length > 0){
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
    if(event.checked || event == null){
      this.saveInStorageAlarmStatus();
      this.interval = Observable.timer(300,15000);
      this.subscription = this.interval.subscribe(t=>{
        let urlBase = !document.URL.startsWith('http') ? "http://dspx.eu/antea25" : "";
        let url = urlBase + "/api/loc/getMotion/0004A30B00201302/" + this.getCurrentDate();
        this.http.get(url).subscribe(p => {
          
          //as it is asynchrone if user stop alarm
          if(event.checked){ 
              if(p.json() == true && this.alertClosed)
              {
                this.schedulePushNotification();
              }
          }
        });
      });
    }
    //Unsubscribe timer
    if(!event.checked){
      this.subscription.unsubscribe();
      this.saveInStorageAlarmStatus();
    }
  }

  schedulePushNotification(){
    this.localNotifications.schedule({
      id: 1,
      title: 'Antea25 Notification',
      text: 'Something is happening!',
      sound: this.isAndroid? 'file://sound.mp3': 'file://beep.caf',
    });
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
