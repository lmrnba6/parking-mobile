import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {NetworkType} from "./network-type.enum";
import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class NetworkStatus {

  type: NetworkType;
  @JsonProperty("networkType", String, true)
  typeAsString: string = undefined;

  constructor() {
  }

  @JsonProperty("isConnected", Boolean, true)
  private _isConnected: boolean = undefined;

  private networkChangeSubject: BehaviorSubject<boolean> = new BehaviorSubject(this._isConnected);
  public networkChange: Observable<boolean> = this.networkChangeSubject.asObservable();

  get isConnected(): boolean {
    return this._isConnected;
  }

  set isConnected(value: boolean) {
    if (this._isConnected !== value) {
      // only broadcast real changes
      this._isConnected = value;
      this.networkChangeSubject.next(value);
    }
  }

  isConnectedBasedOnType(): boolean {
    return (this.type && (this.type == NetworkType.ETHERNET || this.type == NetworkType.WIFI || this.type == NetworkType.SECOND_GENERATION || this.type == NetworkType.THIRD_GENERATION || this.type == NetworkType.FOURTH_GENERATION || this.type == NetworkType.CELLULAR));
  }

  setType(type: string) {
    this.typeAsString = type;
    switch (type) {
      case 'unknown': {
        this.type = NetworkType.UNKNOWN;
        break;
      }
      case 'ethernet': {
        this.type = NetworkType.ETHERNET;
        break;
      }
      case 'wifi': {
        this.type = NetworkType.WIFI;
        break;
      }
      case '2g': {
        this.type = NetworkType.SECOND_GENERATION;
        break;
      }
      case '3g': {
        this.type = NetworkType.THIRD_GENERATION;
        break;
      }
      case '4g': {
        this.type = NetworkType.FOURTH_GENERATION;
        break;
      }
      case 'cellular': {
        this.type = NetworkType.CELLULAR;
        break;
      }
      case 'none': {
        this.type = NetworkType.NONE;
        break;
      }
      default: {
        this.type = NetworkType.UNKNOWN;
        break;
      }
    }

  }
}
