import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { ListPage } from '../position/position';
import { DevicePage } from '../device/device';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = HomePage;
  tab2Root: any = ListPage;
 tab3Root: any = DevicePage;

  tab1Title = "Home";
  tab2Title = "Positions";
  tab3Title = "Devices";

  constructor() {
    };
}
