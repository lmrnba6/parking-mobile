import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class SimInfoCheckin {

  @JsonProperty("phoneNumber", String, true)
  phoneNumber: string = undefined;

  @JsonProperty("carrierName", String, true)
  carrierName: string = undefined;

  @JsonProperty("countryCode", String, true)
  countryCode: string = undefined;

  @JsonProperty("networkType", String, true)
  networkType: string = undefined;

}
