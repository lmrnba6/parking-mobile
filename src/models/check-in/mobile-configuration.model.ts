import {JsonObject} from "json2typescript";
import {JsonProperty} from "json2typescript";
import {Versions} from "./versions";
import {UserProfile} from "../business/user-profile.model";

@JsonObject
export class MobileConfiguration {

  @JsonProperty("userProfile", UserProfile)
  userProfile: UserProfile = undefined;

  @JsonProperty("versions", Versions, true)
  versions: Versions = undefined;

}
