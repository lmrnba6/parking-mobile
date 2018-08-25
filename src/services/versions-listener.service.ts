import {Injectable} from "@angular/core";
import {Platform} from "ionic-angular";
import {Alert} from "ionic-angular";
import {AlertController} from "ionic-angular";
import {Events} from "ionic-angular";
import {combineLatest} from "rxjs/observable/combineLatest";
import {UserProfile} from "../models/business/user-profile.model";
import {IonicDeployStatus} from "./ionic-deploy-status";
import {Versions} from "../models/check-in/versions";
import {TranslateService} from "@ngx-translate/core";
import {IonicDeploy} from "./ionic-deploy.service";
import {AuthenticationService} from "./authentication.service";


const CONFIG = {
  IOS_APPLE_STORE_URL: 'itms-apps://itunes.apple.com/app/idxxxxxx',
  ANDROID_PLAY_STORE_URL: 'market://details?id=xxxxxxx'
};


@Injectable()
export class VersionsListenerService {

  public userProfile: UserProfile;
  private deployStatus: IonicDeployStatus;
  private alert: Alert;
  private isVersionOutdatedAlertDisplayed = false;
  private isNativeInstallButtonDisplayed = false;
  private isNewVersionAvailable = false;
  private versions: Versions;
  private logOutbutton;
  private nativeButton;
  private ionicButton;


  constructor(
              private alertCtrl: AlertController,
              private translateService: TranslateService,
              private ionicDeploy: IonicDeploy,
              private platform: Platform,
              private authService: AuthenticationService
  ) {
    combineLatest(this.ionicDeploy.observableStatus)
      .subscribe(([status]) => {
        this.deployStatus = status;
        this.versions = new Versions();
        if (this.userProfile && this.versions && this.versions.isOutdated) {
          this.checkIfUserVersionIsOutdated();
        }
      });
  }

  private checkIfUserVersionIsOutdated() {
    if (!this.logOutbutton) {
      this.logOutbutton = {
        text: this.translateService.instant('logout.label'),
        handler: () => this.goToLoginPage()
      };
    }
    if (!this.ionicButton) {
      this.ionicButton = {
        text: this.translateService.instant('deploy.newVersionInstallLong'),
        handler: () => this.installNewVersion()
      };
    }
    if (!this.nativeButton) {
      this.nativeButton = {
        text: this.translateService.instant('deploy.openAppStore'),
        handler: () => {
          if (this.platform.is("ios")) {
            window.location.href = CONFIG.IOS_APPLE_STORE_URL;
          } else {
            window.open(CONFIG.ANDROID_PLAY_STORE_URL);
          }
          return false;
        }
      };
    }

    this.isNativeInstallButtonDisplayed = !(this.deployStatus && this.deployStatus.newVersionAvailable);
    this.isNewVersionAvailable = this.deployStatus && this.deployStatus.newVersionAvailable;
    let buttons = [this.logOutbutton, this.isNewVersionAvailable ? this.ionicButton : this.nativeButton];
    let title = this.translateService.instant('deploy.versionIsOutdated');
    let subTitle = this.platform.is("ios") ? 'deploy.checkAppStore' : 'deploy.checkPlayStore';
    if (this.isNewVersionAvailable && this.isNativeInstallButtonDisplayed) {
      this.alert && this.alert.dismiss();
    }
    this.alert = this.alertCtrl.create({
      title,
      subTitle: !this.isNewVersionAvailable ? this.translateService.instant(subTitle) : '',
      buttons,
      enableBackdropDismiss: false
    });
    this.alert.onDidDismiss(() => {
      if (this.userProfile) {
        this.alert.present();
      } else {
        this.isVersionOutdatedAlertDisplayed = false;
      }
    });
    if (!this.isVersionOutdatedAlertDisplayed) {
      this.alert.present();
      this.isVersionOutdatedAlertDisplayed = true;
    }
  }

  private goToLoginPage() {
    this.authService.logout();
  }

  private installNewVersion() {
    this.ionicDeploy.installNewVersion();
  }

}
