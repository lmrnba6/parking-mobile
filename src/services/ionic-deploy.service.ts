import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Injectable, NgZone} from "@angular/core";
import {IonicDeployStatus} from "./ionic-deploy-status";
import {Observable} from "rxjs/Observable";
import {Platform, ToastController} from "ionic-angular";
import {LoadingController} from "ionic-angular";
import {TranslateService} from "@ngx-translate/core";
import {Storage} from "@ionic/storage";
import {LogService} from "./log.service";

declare var IonicCordova;

const CONFIG = {
  CHANNEL: "IONIC_DEPLOY_CHANNEL"
};

@Injectable()
export class IonicDeploy {

  private runningDeploy: boolean = false;
  private isCordovaEnv: boolean = false;
  private pluginWasInitialized: boolean = false;

  private downloadingPrefix: string = 'Téléchargement';
  private extractingPrefix: string = 'Extraction';

  private deployStatusBehaviorSubject: BehaviorSubject<IonicDeployStatus> = new BehaviorSubject(new IonicDeployStatus());
  public observableStatus: Observable<IonicDeployStatus> = this.deployStatusBehaviorSubject.asObservable();

  private _channel: string = 'Production';

  private channels: Array<String> = [
    'yellow',
    'purple',
    'green',
    'blue'
  ];

  constructor(
              private platform: Platform,
              private toastCtrl: ToastController,
              private translate: TranslateService,
              private zone: NgZone,
              private storage: Storage,
              private log: LogService,
              private loadingCtrl: LoadingController,) {}

  get channel(): string {
    return this._channel;
  }

  removeChannelFromStorage() {
    return this.storage.remove(CONFIG.CHANNEL)
  }

  init() {
    this.translate.get('deploy.downloadPrefix').subscribe(value => this.downloadingPrefix = value);
    this.translate.get('deploy.extractPrefix').subscribe(value => this.extractingPrefix = value);

    this.onlyIfCordovaEnv();

    this.log.info("Initializing Ionic deploy plugin with channel : " + this._channel);

    return new Promise((resolve, reject) => {
      IonicCordova.deploy.init({channel: this._channel}, () => {
        this.pluginWasInitialized = true;
        resolve(true);
      }, err => reject(err))
    });
  }

  check() {
    this.onlyIfPluginInitialized();
    return new Promise((resolve, reject) => {
      IonicCordova.deploy.check(result => {
        this.log.info('Ionic deploy check says ' + result + ' for channel ' + this._channel);
        if (result && result === 'true') {
          this.deployStatusBehaviorSubject.next(new IonicDeployStatus(true));
        } else {
          this.deployStatusBehaviorSubject.next(new IonicDeployStatus(false));
        }
        resolve((result === 'true'))
      }, err => reject(err));
    });
  }

  download(onProgress) {
    this.onlyIfPluginInitialized();
    return new Promise((resolve, reject) => {
      IonicCordova.deploy.download(result => {
        if (result === 'true') {
          resolve(result);
          return;
        }
        const percent = (result === 'true' || result === 100) ? 100 : result;
        this.zone.run(() => onProgress(percent));
      }, err => {
        reject(err);
      });
    });
  }

  extract(onProgress) {
    this.onlyIfPluginInitialized();
    return new Promise((resolve, reject) => {
      let withExtraction = false;
      IonicCordova.deploy.extract(result => {
        if (result === 'done' || result === true || result === 'true') {
          resolve({result: result, withExtraction: withExtraction});
          return;
        }
        const percent = (result === 'done' || result === true || result === 'true') ? 100 : result;
        withExtraction = true;
        this.zone.run(() => onProgress(percent));
      }, err => reject(err));
    });
  }

  load() {
    this.onlyIfPluginInitialized();
    return new Promise((resolve, reject) => {
      IonicCordova.deploy.redirect((info) => {
        resolve(true)
      }, err => {
        reject(err)
      });
    });
  }

  info() {
    this.onlyIfPluginInitialized();
    return new Promise((resolve, reject) => {
      IonicCordova.deploy.info(result => resolve(result), err => reject(err));
    });
  }

  getVersions() {
    this.onlyIfPluginInitialized();
    return new Promise((resolve, reject) => {
      IonicCordova.deploy.getVersions()(result => resolve(result), err => reject(err));
    });
  }

  deleteVersion(uuid) {
    this.onlyIfPluginInitialized();
    return new Promise((resolve, reject) => {
      IonicCordova.deploy.deleteVersion(uuid, () => resolve(true), err => reject(err));
    });
  }

  installNewVersion(): Promise<any> {
    if (this.runningDeploy) return Promise.resolve();

    this.log.info("Installing latest ionic deploy version (if available) for channel " + this._channel);

    let toast = this.toastCtrl.create({
      message: this.downloadingPrefix + ' ... 0%',
      position: 'bottom',
      showCloseButton: false,
      closeButtonText: 'Cancel'
    });
    let loading = this.loadingCtrl.create({spinner: 'crescent', dismissOnPageChange: true});

    return this.check()
      .then((snapshotAvailable) => {
        this.log.info("Ionic deploy : checking before installing new snapshot : " + snapshotAvailable + " for channel " + this._channel);
        if (snapshotAvailable) {
          this.runningDeploy = true;
          toast.present();
          return this.download(percent => toast.setMessage(this.downloadingPrefix + ' ... ' + percent + '%'));
        } else {
          return Promise.reject('Ionic deploy : no snapshot available for channel ' + this._channel + ', aborting installation.');
        }
      })
      .then(() => {
          return this.extract(percent => toast.setMessage(this.extractingPrefix + ' ... ' + percent + '%'));
        }
      )
      .then(() => {
        this.log.info("Ionic deploy : Ionic install, reloading the app");
        loading.present();
        return this.load();
      })
      .then(() => {
        this.log.info("Ionic deploy : Ionic install, done.");
        toast.dismiss();
        loading.dismissAll();
        this.runningDeploy = false;
      })
      .catch((error) => {
        this.log.error('Ionic deploy : deploy process catching with a message', error);
        this.runningDeploy = false;
        toast.dismiss();
        loading.dismissAll();
      });
  }

  private onlyIfCordovaEnv() {
    if (!this.isCordovaEnv) {
      this.log.error('Ionic deploy : IonicDeploy was not run in cordova environment!');
      return;
    }
  }

  private onlyIfPluginInitialized() {
    if (!this.pluginWasInitialized) {
      this.log.error('Ionic deploy : IonicDeploy was not initialized, you should call init method!');
      return;
    }
  }

}
