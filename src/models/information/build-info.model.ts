import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class BuildInfo {
  @JsonProperty("version", String)
  version: string = undefined;
}

