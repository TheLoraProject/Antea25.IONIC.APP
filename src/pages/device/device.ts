import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from "rxjs";
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';

declare var google; 

@Component({
  selector: 'page-device',
  templateUrl: 'device.html'
})

export class DevicePage {
  private isAlarmOn : boolean;
  private isAndroid : boolean;
  public map : any;
  public deviceList :any;

  @ViewChild('map') mapElement;

  constructor(public navCtrl: NavController, 
    public alertCtrl: AlertController, 
    public http: Http,
    public storage: Storage,
    private platform: Platform)
    {
      //detect platform
      this.isAndroid = !this.platform.is('ios');
      this.isAlarmOn = false;

      let urlBase = !document.URL.startsWith('http') ? "http://dspx.eu/antea25" : "";
      let url = urlBase + "/api/MyDevice/GetDeviceList/a17767b1-820f-4f0b-948b-acd9cd1a242a";
      http.get(url).subscribe(data => {
        this.deviceList = data.json();     
      });
  }

  ionViewDidLoad(){
    this.readFromStorageAlarmStatus(); 
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
