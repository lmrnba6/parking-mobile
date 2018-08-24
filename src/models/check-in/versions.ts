import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class Versions {

  @JsonProperty("minimumRequiredVersion", String, true)
  minimumRequiredVersion: string = undefined;

  @JsonProperty("currentVersion", String, true)
  currentVersion: string = undefined;

  @JsonProperty("isOutdated", Boolean, true)
  isOutdated: boolean = undefined;

}
