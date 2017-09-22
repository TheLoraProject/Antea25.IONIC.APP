import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';

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

      let url = "/proxy-antea25/loc/getgpsdata/a17767b1-820f-4f0b-948b-acd9cd1a242a";
      http.get(url).subscribe(data => {
        this.result = data.json();
        console.log(this.result);
      
      });





    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    // Let's populate this page with some filler content for funzies
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    'american-football', 'boat', 'bluetooth', 'build'];

    this.items = [];
    for (let i = 1; i < 11; i++) {
      // this.items.push({
      //   //title: 'Item ' + i,
      //  // note: 'This is item #' + i,
      //  // icon: this.icons[Math.floor(Math.random() * this.icons.length)]
      // });
    }
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(ListPage, {
      item: item
    });
  }
}
