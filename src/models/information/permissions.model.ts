import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
export class Permission {
  @JsonProperty("authorizationStatus", String, true)
  authorizationStatus: string = undefined;
}

@JsonObject
export class PushType {
  @JsonProperty("alert", Boolean, true)
  alert: boolean = undefined;
  @JsonProperty("abadgelert", Boolean, true)
  badge: boolean = undefined;
  @JsonProperty("sound", Boolean, true)
  sound: boolean = undefined;
}

@JsonObject
export class PushPermission extends Permission {
  @JsonProperty("isRemoteNotificationEnabled", Boolean, true)
  isRemoteNotificationEnabled: boolean = undefined;
  @JsonProperty("isRegistered", Boolean, true)
  isRegistered: boolean = undefined;
  @JsonProperty("type", PushType, true)
  type: PushType = undefined;
}

@JsonObject
export class AuthorizablePermission extends Permission {
  @JsonProperty("isAuthorized", Boolean, true)
  isAuthorized: boolean = undefined;
  @JsonProperty("isAvailable", Boolean, true)
  isAvailable: boolean = undefined;
}

@JsonObject
export class HardwarePermission extends AuthorizablePermission {
  @JsonProperty("isPresent", Boolean, true)
  isPresent: boolean = undefined;
}

@JsonObject
export class LocationPermission extends AuthorizablePermission {
  @JsonProperty("mode", String, true)
  mode: string = undefined;
  @JsonProperty("isEnabled", Boolean, true)
  isEnabled: boolean = undefined;
}

@JsonObject
export class Permissions {
  @JsonProperty("camera", HardwarePermission, true)
  camera: HardwarePermission = new HardwarePermission();
  @JsonProperty("push", PushPermission, true)
  push: PushPermission = new PushPermission();
  @JsonProperty("location", LocationPermission, true)
  location: LocationPermission = new LocationPermission();
  @JsonProperty("phone", Permission, true)
  phone: Permission = new Permission();
}

