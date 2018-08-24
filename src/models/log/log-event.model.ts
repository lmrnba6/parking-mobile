import {JsonConverter, JsonCustomConvert, JsonObject, JsonProperty} from "json2typescript";
import {MomentDateConverter, ObjectArrayConverter} from "../../util/json-converter/json-converter";
import * as moment from "moment";
import {LogLevelEnum} from "./log-level.enum";


@JsonConverter
export class LogLevelEnumConverter implements JsonCustomConvert<LogLevelEnum> {
  serialize(enumValue: LogLevelEnum): string {
    return LogLevelEnum[enumValue];
  }

  deserialize(enumValue: string): LogLevelEnum {
    return LogLevelEnum[enumValue.toUpperCase()];
  }
}

@JsonObject
export class LogEvent {

  @JsonProperty("date", MomentDateConverter)
  date: moment.Moment = undefined;

  @JsonProperty("message", String)
  message: string = undefined;

  @JsonProperty("objects", ObjectArrayConverter, true)
  objects: any[] = undefined;

  @JsonProperty("level", LogLevelEnumConverter)
  level: LogLevelEnum = undefined;

}
