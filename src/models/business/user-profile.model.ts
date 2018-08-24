import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class UserProfile {

  @JsonProperty("id", Number)
  id: number = undefined;

  @JsonProperty("firstName", String)
  firstName: string = undefined;

  @JsonProperty("lastName", String)
  lastName: string = undefined;

  @JsonProperty("username", String)
  username: string = undefined;

  @JsonProperty("email", String)
  email: string = undefined;

  @JsonProperty("roles", [String], true)
  roles: string[] = undefined;

  isHaulerEmployeeManager() {
    return this.roles.find(role => role === 'ROLE_ADMIN')
  }

  isHaulerEmployee() {
    return this.roles.find(role => role === 'ROLE_USER')
  }

}
