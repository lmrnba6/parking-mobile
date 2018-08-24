import {JsonObject, JsonProperty} from "json2typescript";
import {MomentDateConverter} from "../../util/json-converter/json-converter";
import moment from "moment";

@JsonObject
export class Position {

  @JsonProperty("id", Number)
  id: number = undefined;

  @JsonProperty("accuracy", Number, true)
  accuracy: number = undefined;

  @JsonProperty("latitude", Number)
  latitude: number = undefined;

  @JsonProperty("longitude", Number)
  longitude: number = undefined;

  @JsonProperty("dateEmitted", MomentDateConverter)
  dateEmitted: moment.Moment = undefined;

  constructor(latitude?: number, longitude?: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

}
