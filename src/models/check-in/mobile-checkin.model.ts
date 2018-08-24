import {JsonObject, JsonProperty} from "json2typescript";
import {DeviceInfoCheckin} from "./device-info.model";
import {AppInfoCheckin} from "./app-info.model";
import {SimInfoCheckin} from "./sim-info.model";

@JsonObject
export class MobileCheckIn {

  @JsonProperty("deviceInfo", DeviceInfoCheckin)
  deviceInfo: DeviceInfoCheckin = undefined;

  @JsonProperty("appInfo", AppInfoCheckin)
  appInfo: AppInfoCheckin = undefined;

  @JsonProperty("simInfo", SimInfoCheckin, true)
  simInfo: SimInfoCheckin = undefined;

  @JsonProperty("permissions", String, true)
  permissions: string = undefined;

  @JsonProperty("userSettings", String, true)
  userSettings: string = undefined;

}
