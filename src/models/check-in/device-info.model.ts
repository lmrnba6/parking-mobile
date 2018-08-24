import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class DeviceInfoCheckin {

  @JsonProperty("uuid", String)
  uuid: string = undefined;

  @JsonProperty("manufacturer", String, true)
  manufacturer: string = undefined;

  @JsonProperty("model", String, true)
  model: string = undefined;

  @JsonProperty("osVersion", String, true)
  osVersion: string = undefined;

  @JsonProperty("platform", String, true)
  platform: string = undefined;

  @JsonProperty("serial", String, true)
  serial: string = undefined;

  @JsonProperty("selectedLanguage", String, true)
  selectedLanguage: string = undefined;

  @JsonProperty("deviceLanguage", String, true)
  deviceLanguage: string = undefined;

  @JsonProperty("batteryCharge", String, true)
  batteryCharge: string = undefined;

}
