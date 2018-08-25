import {Injectable} from '@angular/core';
import {AlertController} from "ionic-angular";
import {ToastController} from "ionic-angular";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Toast} from "ionic-angular/components/toast/toast";
import {UserProfile} from "../models/business/user-profile.model";
import {ConnectionStatus} from "../models/information/connection-status.model";
import {DeviceInfo} from "../models/information/device-info.model";
import {LogService} from "./log.service";

@Injectable()
export class ConnectionStatusService {

  private internetConnected: boolean;
  private userProfile: UserProfile;

  private _connectionStatusTrigger: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(new ConnectionStatus());
  public connectionStatusSubscription: Observable<ConnectionStatus> = this._connectionStatusTrigger.asObservable();

  private currentToast: Toast;

  private lastStatus: ConnectionStatus;

  constructor(private deviceInfo: DeviceInfo,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private translateService: TranslateService,
              private log: LogService,) {

    this.deviceInfo.networkStatus.networkChange
      .subscribe(next => {
        this.internetConnected = next;
        this.reactFromStatusChange(false);
      });

    this.reactFromStatusChange(false);

    setInterval(() => {
      this.reactFromStatusChange(false);
    }, 1 * 1000);
  }

  getConnectionErrorMessage(connectionStatus: ConnectionStatus) {
    if (!connectionStatus.isNetworkConnected) {
      return 'messages.errors.connection_problem_menu_label';
    } else if (connectionStatus.isNetworkConnected) {
      return 'messages.errors.mqtt_problem_menu_label';
    } else {
      return 'messages.errors.connection_problem_menu_label';
    }
  }

  displayTroobleshootingToast(connectionStatus: ConnectionStatus) {
    if (this.currentToast) {
      try {
        this.currentToast.dismiss();
      } catch (e) {
      }
    }
    let messages = this.getTroubleshootingMessages(connectionStatus);
    if (messages) {
      this.currentToast = this.toastCtrl.create({
        message: messages.subTitle,
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: this.translateService.instant('actions.ok')
      });
      this.currentToast.present();
    }
  }

  getTroubleshootingMessages(connectionStatus: ConnectionStatus): any {
    let messages;
    if (!connectionStatus.isNetworkConnected) {
      messages = {
        title: this.translateService.instant('messages.errors.connection_status.no_internet.title'),
        subTitle: this.translateService.instant('messages.errors.connection_status.no_internet.subTitle')
      };
    }
    return messages;
  }

  private reactFromStatusChange(displayAlert: boolean = false) {
    let connectionStatus = new ConnectionStatus();
    connectionStatus.isResolved = true;
    connectionStatus.isAuthenticated = this.userProfile != null;
    connectionStatus.isNetworkConnected = this.internetConnected;

    if (!this.lastStatus || (this.lastStatus && !this.lastStatus.isSameAs(connectionStatus))) {
      this.log.debug("New resolved network status is : ", connectionStatus);
      if (this.deviceInfo.networkStatus && this.deviceInfo.networkStatus.typeAsString) {
        this.log.debug("Currently on network : " + this.deviceInfo.networkStatus.typeAsString);
      }
    }
    this.lastStatus = connectionStatus;
    this._connectionStatusTrigger.next(connectionStatus);

    if (connectionStatus.isAuthenticated && !connectionStatus.isConnected && displayAlert) {
      this.displayTroobleshootingToast(connectionStatus);
    }
  }


}
