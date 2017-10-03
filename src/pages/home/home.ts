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
  private isAlarmOn : boolean;
  private interval;
  private subscription;
  private alert;
  private isAndroid : boolean;
  private alertClosed = true;
  public map : any;

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
    //   this.platform.ready().then(rdy=>{
    //       this.localNotifications.on('click', (notification, state)=>{
    //         this.showAlert('Antea25 ALARM!', 'Something is happening!');
    //   })
    // });
  }

  ionViewDidLoad(){
    this.readFromStorageAlarmStatus(); 
    this.showLastPosition();
  }

  showLastPosition(){
    let urlBase = !document.URL.startsWith('http') ? "http://dspx.eu/antea25" : "";
    let url = urlBase + "/api/loc/getgpsdata/a17767b1-820f-4f0b-948b-acd9cd1a242a";
    this.http.get(url).subscribe(data => {
      if(data.json().length > 0){
        this.initMap(data.json()[data.json().length-1].gpsPositionLatitude, data.json()[data.json().length-1].gpsPositionLongitude)
      }
      else{
        //Else default position is London
        this.initMap(55, -1.5);
      }
    },err => {
      this.initMap(55, -1.5);
      this.showAlert('Antea25 ERROR!', 'network not available');
    });
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
        let url = urlBase + "/api/loc/getMotion/a17767b1-820f-4f0b-948b-acd9cd1a242a/" + this.getCurrentDate();
        this.http.get(url).subscribe(p => {
          
          //as it is asynchrone if user stop alarm
          if(event.checked){ 
              if(p.json() == true && this.alertClosed)
              {
                this.showAlert('Antea25 ALARM!', 'Something is happening!')
                this.showPushNotification();
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

  showPushNotification(){
    this.localNotifications.schedule({
      id: 1,
      title: 'Antea25 ALARM!',
      text: 'Something is happening!',
      data: { secret: 123 },
      //sound: this.isAndroid? 'file://sound.mp3': 'file://beep.caf',
    });
    this.localNotifications.isPresent(1);
  }

  showAlert(myTitle : string, mySubTitle : string ){
    this.alertClosed = false;  
    this.alert = this.alertCtrl.create({
      title: myTitle,
      subTitle: mySubTitle,
      buttons: [{text: 'OK', role: 'cancel',
        handler: () => {
          this.alertClosed = true;  
        }
      }]
    });
    this.alert.present(); 
  }

  getCurrentDate() : string{
    let currentDate = new Date();
    console.log(new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)));
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
