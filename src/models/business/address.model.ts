import {Position} from "./position.model";
import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class Address {
  @JsonProperty("label", String, true)
  label: string = undefined;

  @JsonProperty("addressOneLine", String, true)
  addressOneLine: string = undefined;

  @JsonProperty("appartNumber", String, true)
  appartNumber: string = undefined;

  @JsonProperty("streetNumber", String, true)
  streetNumber: string = undefined;

  @JsonProperty("streetName", String, true)
  streetName: string = undefined;

  @JsonProperty("postcode", String, true)
  postcode: string = undefined;

  @JsonProperty("city", String, true)
  city: string = undefined;

  @JsonProperty("state", String, true)
  state: string = undefined;

  @JsonProperty("country", String, true)
  country: string = undefined;

  @JsonProperty("notes", String, true)
  notes: string = undefined;

  @JsonProperty("position", Position, true)
  position: Position = undefined;

}
