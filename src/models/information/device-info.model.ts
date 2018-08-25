import {Device} from "@ionic-native/device";
import {BatteryStatusResponse} from "@ionic-native/battery-status";
import {Injectable} from "@angular/core";
import {Platform} from "ionic-angular";
import {BuildInfo} from "./build-info.model";
import {NetworkStatus} from "./network-status.model";
import {JsonObject, JsonProperty} from "json2typescript";
import {Permissions} from "./permissions.model";

@JsonObject
@Injectable()
export class DeviceInfo {

  @JsonProperty("firebaseToken", String, true)
  firebaseToken: string = undefined;

  batteryStatus: BatteryStatusResponse;

  permissions: Permissions = new Permissions();

  @JsonProperty('networkStatus', NetworkStatus, true)
  networkStatus: NetworkStatus = undefined;

  simInfo: Object;
  @JsonProperty("preferredLanguage", String, true)
  preferredLanguage: string = undefined;

  appName: string;

  packageName: string;

  @JsonProperty('buildInfo', BuildInfo, true)
  buildInfo: BuildInfo = undefined;

  ionicVersion: string; //TODO
  nativeVersion: string;
  nativeVersionCode: string | number;

  isDebug: boolean;

  mqttConnected: boolean = false;

  _uuid: string;

  constructor(private device: Device,
              private ionicPlatform: Platform,) {
    this.networkStatus = new NetworkStatus();

    this.ionicPlatform.ready()
      .then(() => {
        console.log('platform ready,');
        if (this.ionicPlatform.is("core")) {
          console.log('platform is core! or something else');
        } else {
          console.log('platform is not core', window.location, window);
          if (this.ionicPlatform.is('android')) {
            console.log('on a device running Android.');
          }
          if (this.ionicPlatform.is('cordova')) {
            console.log('on a device running Cordova.');
          }
          if (this.ionicPlatform.is('core')) {
            console.log('on a desktop device.');
          }
          if (this.ionicPlatform.is('ios')) {
            console.log('on a device running iOS.');
          }
          if (this.ionicPlatform.is('ipad')) {
            console.log('on an iPad device.');
          }
          if (this.ionicPlatform.is('iphone')) {
            console.log('on an iPhone device.');
          }
          if (this.ionicPlatform.is('mobile')) {
            console.log('on a mobile device.');
          }
          if (this.ionicPlatform.is('mobileweb')) {
            console.log('in a browser on a mobile device.');
          }
          if (this.ionicPlatform.is('phablet')) {
            console.log('on a phablet device.');
          }
          if (this.ionicPlatform.is('tablet')) {
            console.log('on a tablet device.');
          }
          if (this.ionicPlatform.is('windows')) {
            console.log('on a device running Windows.');
          }
        }
      });
  }

  get unifiedVersion(): string {
    if (this.buildInfo && this.buildInfo.version) {
      return this.buildInfo.version;
    } else {
      return 'DEV_VERSION'
    }
  }

  isDevice(): boolean {
    return this.ionicPlatform.is('cordova') && this.device !== undefined;
  }

  isVirtual(): boolean {
    return this.device.isVirtual;
  }

  manufacturer(): string {
    return this.device.manufacturer;
  }

  model(): string {
    return this.device.model;
  }

  platform(): string {
    return this.device.platform;
  }

  serial(): string {
    return this.device.serial;
  }

  osVersion(): string {
    return this.device.version;
  }

  get uuid(): string {
    return this._uuid;
  }

  set uuid(uuid: string) {
    this._uuid = uuid;
  }

  phoneNumber(): string {
    if (this.simInfo) {
      return this.simInfo['phoneNumber'];
    } else {
      return null;
    }
  }

  carrierName(): string {
    if (this.simInfo) {
      return this.simInfo['carrierName'];
    } else {
      return null;
    }
  }

  countryCode(): string {
    if (this.simInfo) {
      return this.simInfo['countryCode'];
    } else {
      return null;
    }
  }

  networkType(): string {
    if (!this.simInfo) {
      return null;
    }
    switch (this.simInfo['networkType']) {
      case 0: {
        return 'unknown';
      }
      case 1: {
        return 'GPRS';
      }
      case 2: {
        return 'EDGE';
      }
      case 3: {
        return 'UMTS';
      }
      case 4: {
        return 'CDMA';
      }
      case 5: {
        return 'EVDO rev 0';
      }
      case 6: {
        return 'EVDO rev A';
      }
      case 7: {
        return '1xRTT';
      }
      case 8: {
        return 'HSDPA';
      }
      case 9: {
        return 'HSUPA';
      }
      case 10: {
        return 'HSPA';
      }
      case 11: {
        return 'iDen';
      }
      case 12: {
        return 'EVDO rev B';
      }
      case 13: {
        return 'LTE';
      }
      case 14: {
        return 'eHRPD';
      }
      case 15: {
        return 'HSPA+';
      }
      case 16: {
        return 'GSM';
      }
      case 17: {
        return 'TD-SCDMA';
      }
      case 18: {
        return 'IWLAN';
      }

      default: {
        return 'unknown';
      }
    }
  }
}

