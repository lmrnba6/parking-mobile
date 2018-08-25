import {Component} from "@angular/core";
import {AlertController, MenuController, NavController, ToastController} from "ionic-angular";
import {HomePage} from "../home/home";
import {RegisterPage} from "../register/register";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from "../../services/authentication.service";
import { TranslateService } from '@ngx-translate/core';
import {ConnectionStatus} from "../../models/information/connection-status.model";
import {ConnectionStatusService} from "../../services/connection-status-service";
import {Subject} from "rxjs";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  private loginForm : FormGroup;
  private connectionStatus: ConnectionStatus = new ConnectionStatus();
  private unsubscribe: Subject<void> = new Subject<void>();
  public statusColor: string;

  constructor(private connectionStatusService: ConnectionStatusService, private authenticationService: AuthenticationService, public formBuilder: FormBuilder,
              translate: TranslateService, public nav: NavController, public forgotCtrl: AlertController, public menu: MenuController, public toastCtrl: ToastController) {
    this.menu.swipeEnable(false);
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    if (!this.authenticationService.isTokenExpired()) {
      this.nav.setRoot(HomePage);
    }
    translate.setDefaultLang('fr');
    this.connectionStatusService.connectionStatusSubscription
      .takeUntil(this.unsubscribe)
      .subscribe((next) => {
        this.connectionStatus = next;
        if (!this.connectionStatus.isConnected) {
          this.statusColor = 'red';
        } else {
          this.statusColor = 'green';
        }
      });
  }

  // go to register page
  register() {
    this.nav.setRoot(RegisterPage);
  }

  // login and go to home page
  login() {
    this.authenticationService.login((this.loginForm as any).email, (this.loginForm as any).password)
      .subscribe(
        data => {
          this.nav.setRoot(HomePage);
        },
        error => {
          console.log(error)
        });
  }

  forgotPass() {
    let forgot = this.forgotCtrl.create({
      title: 'Forgot Password?',
      message: "Enter you email address to send a reset link password.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email',
          type: 'email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Send',
          handler: data => {
            console.log('Send clicked');
            let toast = this.toastCtrl.create({
              message: 'Email was sended successfully',
              duration: 3000,
              position: 'top',
              cssClass: 'dark-trans',
              closeButtonText: 'OK',
              showCloseButton: true
            });
            toast.present();
          }
        }
      ]
    });
    forgot.present();
  }

}
