import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class AppInfoCheckin {

  @JsonProperty("name", String)
  name: string = undefined;

  @JsonProperty("unifiedVersion", String)
  unifiedVersion: string = undefined;

  @JsonProperty("nativeVersion", String)
  nativeVersion: string = undefined;

  @JsonProperty("ionicVersion", String)
  ionicVersion: string = undefined;

}
