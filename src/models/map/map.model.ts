import {JsonObject, JsonProperty} from "json2typescript";


@JsonObject
export class MapPosition {
  @JsonProperty("lat", Number)
  lat: number = undefined;
  @JsonProperty("lng", Number)
  lng: number = undefined;
}
