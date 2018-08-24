import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class PhoneNumber {

  @JsonProperty("label", String)
  label: string = undefined;

  @JsonProperty("number", String)
  number: string = undefined;
}
