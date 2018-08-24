import {JsonObject} from "json2typescript";
import {JsonProperty} from "json2typescript";


@JsonObject
export class PaymentMode {

  @JsonProperty("enabled", Boolean, true)
  enabled: boolean = undefined;
  @JsonProperty("mode", String, true)
  mode: String = undefined;

}
