import {Injectable} from "@angular/core";
import {LogLevelEnum} from "../models/log/log-level.enum";
import {LogEvent} from "../models/log/log-event.model";
import moment from "moment";



@Injectable()
export class LogService {

  public userLogLevel: LogLevelEnum = null;

  constructor() {}

  private logMessage(level: LogLevelEnum, message: string, objects: any[]): void {
    try {
      let logEvent = new LogEvent();
      logEvent.date = moment();
      logEvent.message = message;
      logEvent.objects = objects;
      logEvent.level = level;
      if (logEvent.level >= this.userLogLevel) {
        this.outputLogEvent(logEvent);
        // this.logEvents.next(logEvent);
      }
    } catch (e) {
      console.error("Unable to log message", level, message, objects);
    }
  }

  private outputLogEvent(logEvent: LogEvent): void {
    let logMessage = `[${LogLevelEnum[logEvent.level]}] ${logEvent.date.format('YYYY-MM-DDTHH:mm:ss.SSSZ')} - ${logEvent.message}`;
    if (logEvent.objects && logEvent.objects.length > 0) {
      console.log(logMessage, logEvent.objects);
    } else {
      console.log(logMessage);
    }
  }

  public info(message: string, ...objects: any[]): void {
    this.logMessage(LogLevelEnum.INFO, message, objects);
  }

  public debug(message: string, ...objects: any[]): void {
    this.logMessage(LogLevelEnum.DEBUG, message, objects);
  }

  public error(message: string, ...objects: any[]): void {
    this.logMessage(LogLevelEnum.ERROR, message, objects);
  }

  public fatal(message: string, ...objects: any[]): void {
    this.logMessage(LogLevelEnum.FATAL, message, objects);
  }

  public trace(message: string, ...objects: any[]): void {
    this.logMessage(LogLevelEnum.TRACE, message, objects);
  }

  public warn(message: string, ...objects: any[]): void {
    this.logMessage(LogLevelEnum.WARN, message, objects);
  }

  public off(message: string, ...objects: any[]): void {
    this.logMessage(LogLevelEnum.OFF, message, objects);
  }
}
