import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import moment from "moment";

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {

  constructor(public translateService: TranslateService,) {
  }

  transform(value: number, ...args) {

    let unit;
    if (value && args && args[0]) {
      unit = args[0];
    } else {
      return '';
    }

    let out = "";
    let duration = moment.duration(value, args[0]);

    if (duration.days() > 0) {
      out += duration.days() + ' ' + this.translateService.instant('messages.days')
    }
    if (duration.hours() > 0) {
      if (out) {
        out += ' ' + this.translateService.instant('messages.and') + ' ';
      }
      out += duration.hours() + this.translateService.instant('messages.hours')
    }
    if (duration.minutes() > 0) {
      out += duration.minutes() + this.translateService.instant('messages.minutes')
    }
    return out;
  }
}
