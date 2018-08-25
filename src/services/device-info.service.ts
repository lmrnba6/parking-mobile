import * as Raven from "raven-js";
import {AppVersion} from "@ionic-native/app-version";
import {BatteryStatus, BatteryStatusResponse} from "@ionic-native/battery-status";
import {HttpClient} from "@angular/common/http";
import {Injectable, NgZone} from "@angular/core";
import {IsDebug} from "@ionic-native/is-debug";
import {Network} from "@ionic-native/network";
import {classToPlain, plainToClass} from "../util/json-converter/json-converter";
import {Platform} from "ionic-angular";
import {Pro} from '@ionic/pro';
import {Sim} from "@ionic-native/sim";
import {Subscription} from "rxjs/Subscription";
import {Device} from "@ionic-native/device";
import Fingerprint2 from "fingerprintjs2";
import {Diagnostic} from "@ionic-native/diagnostic";
import {DeviceInfo} from "../models/information/device-info.model";
import {EndpointService} from "./endpoint.service";
import {LogService} from "./log.service";
import {BuildInfo} from "../models/information/build-info.model";
import {Global} from "../app/app.module";
import {HardwarePermission} from "../models/information/permissions.model";
import {LocationPermission} from "../models/information/permissions.model";

const CONFIG = {
  PERMISSIONS_PATH: '/mobile/v2/permissions'
};

@Injectable()
export class DeviceInfoService {

  networkChangeSubscription: Subscription;

  batteryChangeSubscription: Subscription;

  constructor(private httpClient: HttpClient,
              private platform: Platform,
              private diagnostic: Diagnostic,
              private batteryStatus: BatteryStatus,
              private sim: Sim,
              private network: Network,
              private deviceInfo: DeviceInfo,
              private isDebug: IsDebug,
              private device: Device,
              private appVersion: AppVersion,
              private zone: NgZone,
              private endpointService: EndpointService,
              private log: LogService,) {
    this.log.debug("Constructing DeviceInfoService...", this.deviceInfo);

    this.httpClient.get("assets/build.json")
      .map((body: Object) => plainToClass(BuildInfo, body))
      .subscribe((buildInfo: BuildInfo) => {
        if (buildInfo && buildInfo.version) {
          this.deviceInfo.buildInfo = buildInfo;
          this.log.info("#######################################");
          this.log.info("App version is : " + buildInfo.version, buildInfo);
          this.log.info("#######################################");
          Raven.setRelease(buildInfo.version);
          Global.IonicPro = Pro.init('xxxxxxx', {
            appVersion: buildInfo.version
          });
        }
      });
  }

  public init() {
    let blockingPromises = [];
    this.log.info("Initializing DeviceInfoService...");
    // Testing without ionic's network objects
    if (!this.platform.is("cordova")) {
      this.log.info('platform is not cordova !');
      this.deviceInfo.networkStatus.isConnected = true;
      window.addEventListener('online', () => {
        this.zone.run(() => {
          this.deviceInfo.networkStatus.isConnected = true;
        });
      });
      window.addEventListener('offline', () => {
        this.zone.run(() => {
          this.deviceInfo.networkStatus.isConnected = false;
        });
      });
      blockingPromises.push(new Promise((resolve, reject) => {
        new Fingerprint2()
          .get((result: string) => {
            this.deviceInfo.uuid = "browser-" + result;
            this.log.trace("Browser UUID resolved : ", this.deviceInfo.uuid);
            resolve();
          })
      }));
    }
    if (this.platform.is('cordova')) {
      this.updatePermissions();
      this.deviceInfo.uuid = this.device.uuid;
      // ================= platform preferred language =================
      let res = navigator.language;
      this.deviceInfo.preferredLanguage = res;
      // ================= Battery info =================
      this.batteryChangeSubscription = this.batteryStatus.onChange()
        .subscribe(
          (status: BatteryStatusResponse) => {
            this.setBatteryStatus(status);
          }
        );

      // ================= Sim info =================
      this.sim.hasReadPermission()
        .then(
          (info) => {
            console.log('Sim info has permission: ', info);
            if (!info) {
              this.deviceInfo.permissions.phone.authorizationStatus = 'unauthorized';
              return this.sim.requestReadPermission()
                .then(
                  () => {
                    console.log('Sim info permission granted');
                    this.deviceInfo.permissions.phone.authorizationStatus = 'authorized';
                  },
                  () => {
                    console.log('Sim info permission denied');
                    this.deviceInfo.permissions.phone.authorizationStatus = 'denied';
                  }
                );
            } else {
              this.deviceInfo.permissions.phone.authorizationStatus = 'authorized';
              return Promise.resolve();
            }
          }
        )
        .then(() => {
          this.sim.getSimInfo()
            .then(
              (info) => {
                this.log.debug("SIM INFO ARE ", info);
                this.setSimInfo(info);
              },
              (err) => this.log.warn('Unable to get sim info: ', err)
            );
        });


      this.appVersion.getVersionNumber()
        .then(versionNumber => this.deviceInfo.nativeVersion = versionNumber);
      this.appVersion.getVersionCode()
        .then(versionCode => this.deviceInfo.nativeVersionCode = versionCode);
      this.appVersion.getAppName()
        .then(appName => this.deviceInfo.appName = appName);

      this.appVersion.getPackageName()
        .then(packageName => this.deviceInfo.packageName = packageName);

      this.isDebug.getIsDebug()
        .then((isDebug: boolean) => {
            if (isDebug) {
              Raven.setEnvironment('development');
            } else {
              Raven.setEnvironment('production');
            }
            this.deviceInfo.isDebug = isDebug;
          }
        )
        .catch((error: any) => this.log.error(error));

      setTimeout(() => { // See : https://github.com/ionic-team/ionic-native/issues/2317
        // ================= Network =================
        this.deviceInfo.networkStatus.setType(this.network.type);
        this.deviceInfo.networkStatus.isConnected = this.deviceInfo.networkStatus.isConnectedBasedOnType();
        this.networkChangeSubscription = this.network
          .onchange()
          .subscribe(() => {
            this.zone.run(() => {
              this.deviceInfo.networkStatus.setType(this.network.type);
            });
          });

        this.network.onDisconnect()
          .subscribe(() => {
            this.log.info('Network was disconnected. from', this.deviceInfo.networkStatus.isConnected);
            this.zone.run(() => {
              this.deviceInfo.networkStatus.isConnected = false;
            });
          });

        this.network.onConnect()
          .subscribe(() => {
            this.log.info('Network as connected. from', this.deviceInfo.networkStatus.isConnected);
            this.zone.run(() => {
              this.deviceInfo.networkStatus.isConnected = true;
            });
          });

        this.network.onchange()
          .subscribe(status => {
            this.log.info('Network has changed', status);
            if (status.type === 'online') {
              this.log.debug('onchange would reset network to connected', this.deviceInfo.networkStatus.isConnected);
              this.deviceInfo.networkStatus.isConnected = true;
            } else {
              this.log.debug('onchange would reset network to disconnected', this.deviceInfo.networkStatus.isConnected);
              this.deviceInfo.networkStatus.isConnected = false;
            }
          });
      }, 500);

      // Brute monitoring of network connection status
      setInterval(() => {
        this.log.info('Network check by interval based on type (every 15sec)', this.deviceInfo.networkStatus.isConnected, this.network.type);
        if (this.network.type !== 'none') {
          this.deviceInfo.networkStatus.isConnected = true;
        } else {
          this.deviceInfo.networkStatus.isConnected = false;
        }
      }, 15000);
    }

    return Promise.all(blockingPromises);
  }

  public updatePermissions(): Array<Promise<any>> {
    let promises = [];
    promises.push(this.updateCameraPermission(this.deviceInfo.permissions.camera));
    promises.push(this.updateLocationPermission(this.deviceInfo.permissions.location));
    Promise.all(promises)
      .then(results => {
        this.log.debug("Update permissions done.", this.deviceInfo.permissions)
      });
    return promises
  }

  private updateCameraPermission(cameraPermission: HardwarePermission): Array<Promise<any>> {
    let promises = [];
    // console.log('checking camera');
    try {
      promises.push(this.diagnostic.getCameraAuthorizationStatus()
        .then(status => {
          // console.log('checking camera authorization status', status);
          cameraPermission.authorizationStatus = status;
        }, reason => this.log.error('camera authorization status unavailable', reason)));

      promises.push(this.diagnostic.isCameraAvailable()
        .then(available => {
          // console.log('checking camera available', available);
          cameraPermission.isAvailable = available;
        }, reason => this.log.error('camera availability check rejected', reason)));

      promises.push(this.diagnostic.isCameraAuthorized()
        .then(authorized => {
          // console.log('checking camera authorized', authorized);
          cameraPermission.isAuthorized = authorized;
        }, reason => this.log.error('camera authorization status rejected', reason)));

      promises.push(this.diagnostic.isCameraPresent()
        .then(present => {
          // console.log('checking camera present', present);
          cameraPermission.isPresent = present;
        }, reason => this.log.error('camera presence status rejected', reason)));
    } catch (e) {
      this.log.error('some error in camera', e);
      promises.push(Promise.reject(e))
    }
    return promises;
  }

  updateLocationPermission(locationPermission: LocationPermission): Array<Promise<any>> {
    let promises = [];
    // console.log('Checking GPS');
    try {
      promises.push(this.diagnostic.isLocationEnabled()
        .then(enabled => {
          locationPermission.isEnabled = enabled;
        }));

      promises.push(this.diagnostic.isLocationAvailable()
        .then(available => {
          locationPermission.isAvailable = available;
        }));

      promises.push(this.diagnostic.getLocationAuthorizationStatus()
        .then(status => {
          locationPermission.authorizationStatus = status;
        }));

      promises.push(this.diagnostic.isLocationAuthorized()
        .then(authorized => {
          locationPermission.isAuthorized = authorized;
        }));

      if (this.platform.is('android')) {
        promises.push(this.diagnostic.getLocationMode()
          .then(mode => {
            locationPermission.mode = mode;
          }));
      }
    } catch (e) {
      this.log.error('some error in gps', e);
      promises.push(Promise.reject(e))
    }
    return promises;
  }

  public updatedNetworkType(): string {
    if (this.platform.is('cordova')) {
      return this.network.type;
    } else {
      return 'NOT_CORDOVA';
    }
  }

  private setBatteryStatus(batteryStatus: BatteryStatusResponse): void {
    this.deviceInfo.batteryStatus = batteryStatus;
  }

  private setSimInfo(simInfo: Object): void {
    this.deviceInfo.simInfo = simInfo;
  }

  public submitPermissions() {
    const url = this.endpointService.currentEndpoint + CONFIG.PERMISSIONS_PATH + '?id=' + this.deviceInfo.uuid;

    let permissions = classToPlain(this.deviceInfo.permissions);

    return this.httpClient.post(url, permissions, {responseType: 'text'})
      .subscribe();
  }

  updateMqttConnectionStatus(connected: boolean) {
    this.deviceInfo.mqttConnected = connected;
  }
}
