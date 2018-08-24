import {JsonConvert, JsonConverter, JsonCustomConvert, OperationMode, ValueCheckingMode} from "json2typescript";
import moment from "moment";

export type ClassType<T> = {
  new(...args: any[]): T;
};

function constructJsonConverter(debug?: boolean): JsonConvert {
  let jsonConvert: JsonConvert = new JsonConvert();
  if (debug) {
    jsonConvert.operationMode = OperationMode.LOGGING; // print some debug data
  } else {
    jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
  }
  jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
  jsonConvert.valueCheckingMode = ValueCheckingMode.ALLOW_NULL; // don't allow null
  return jsonConvert
}

export function plainToArray<T>(cls: ClassType<T>, plain: Array<Object>, debug?: boolean): Array<T> {
  return constructJsonConverter(debug).deserializeArray(plain, cls);
}

export function plainToClass<T>(cls: ClassType<T>, plain: Object, debug?: boolean): T {
  return constructJsonConverter(debug).deserialize(plain, cls) as T;
}

export function classToPlain(plain: Object, debug?: boolean): Object {
  return constructJsonConverter(debug).serialize(plain) as Object;
}

export function classToClass<T>(cls: ClassType<T>, plain: Object, debug?: boolean): T {
  let jsonConverter = constructJsonConverter(debug);
  let serializedObject = jsonConverter.serialize(plain);
  return jsonConverter.deserialize(serializedObject, cls);
}

@JsonConverter
export class DateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): any {
    return date.toISOString();
  }

  deserialize(date: any): Date {
    return new Date(date);
  }
}

@JsonConverter
export class MomentDateConverter implements JsonCustomConvert<moment.Moment> {
  serialize(date: moment.Moment): any {
    return date.toISOString();
  }

  deserialize(date: string): moment.Moment {
    if (date) {
      let momentDate = moment(date);
      if (momentDate && momentDate.isValid()) {
        return momentDate;
      } else {
        return undefined;
      }
    }
    return undefined;
  }
}

@JsonConverter
export class JsonMapConverter implements JsonCustomConvert<Map<string, string>> {

  serialize(data: Map<string, string>): Array<any> {
    const object = [];
    data.forEach((v, k) => {
      object.push({key: k, value: v})
    });
    return object;
  }

  deserialize(data: Array<any>): Map<string, string> {
    const map = new Map<string, string>();
    data.forEach(item => {
      map.set(item.key, item.value)
    });
    return map;
  }
}

@JsonConverter
export class ObjectArrayConverter implements JsonCustomConvert<any[]> {
  serialize(objects: any[]): string {
    return JSON.stringify(objects);
  }

  deserialize(objects: string): any[] {
    return JSON.parse(objects);
  }
}
