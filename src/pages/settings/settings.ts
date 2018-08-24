import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {LoginPage} from "../login/login";
import {AuthenticationService} from "../../services/authentication.service";


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  constructor(public nav: NavController, private authenticationService: AuthenticationService) {
  }

  // logout
  logout() {
    this.authenticationService.logout();
    this.nav.setRoot(LoginPage);
  }
}
