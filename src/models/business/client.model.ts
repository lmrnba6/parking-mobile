import {PhoneNumber} from "./phone-number.model";
import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class Client {

  @JsonProperty("id", Number)
  id: number = undefined;

  @JsonProperty("firstName", String)
  firstName: string = undefined;

  @JsonProperty("lastName", String)
  lastName: string = undefined;

  @JsonProperty("notes", String, true)
  notes: string = undefined;

  @JsonProperty("organisation", String, true)
  organisation: string = undefined;

  @JsonProperty("phoneNumbers", [PhoneNumber], true)
  phoneNumbers: Array<PhoneNumber> = [];

  simplifiedName() {
    return this.firstName.charAt(0).toUpperCase() + ". " + this.lastName.toUpperCase();
  }

  optimizedName() {
    return this.lastName.toLocaleUpperCase() + ", " + this.firstName;// + 'al;fjas;ld fasfasfe ;ljaksf eas; ljkase f';
  }

}
