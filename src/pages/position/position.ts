import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { PositionDetailPage } from '../positionDetail/positionDetail';

@Component({
  selector: 'page-list',
  templateUrl: 'position.html'
})
export class ListPage {
  selectedItem: any;
  result :any;
  icons: string[];
  items: Array<{gpsPositionLatitude: Float32Array, gpsPositionLongitude: Float32Array, gpsPositionDate: Date}>;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public http: Http ) {
     
      this.items = [];
      let urlBase = !document.URL.startsWith('http') ? "http://dspx.eu/antea25" : "";
      let url = urlBase + "/api/loc/getgps/0004A30B00201302";
      http.get(url).subscribe(data => {
        this.result = data.json();      
      });

    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

   
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(PositionDetailPage, {
      item: item
    });
  }
}
