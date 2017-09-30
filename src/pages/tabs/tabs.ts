import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { ListPage } from '../position/position';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = HomePage;
  tab2Root: any = ListPage;
 // tab3Root: any = Settings;

  tab1Title = "Home";
  tab2Title = "Positions";
  tab3Title = "Settings";

  constructor() {
    };
}
