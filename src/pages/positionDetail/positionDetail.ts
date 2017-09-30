import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from "rxjs";
import { Storage } from '@ionic/storage';
import { NavParams } from 'ionic-angular';

declare var google; 

@Component({
  selector: 'page-home',
  templateUrl: 'positionDetail.html'
})

export class PositionDetailPage {
  isAlarmOn : boolean;
  position : any;
  map : any;

  @ViewChild('map') mapElement;

  constructor(public navCtrl: NavController, private navParams: NavParams){
    this.position = navParams.get('item');
  }

  ionViewDidLoad(){
    this.initMap(this.position.gpsPositionLatitude, this.position.gpsPositionLongitude);
  }

  initMap(lat, lng){
    let latLog = new google.maps.LatLng(lat, lng); 

    let mapOptions = {
      center: latLog,
      zoom: 15,
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

  

  getCurrentDate() : string{
    let currentDate = new Date();
    return new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('.')[0];
  }
}
