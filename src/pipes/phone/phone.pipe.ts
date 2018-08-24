import {Pipe, PipeTransform} from '@angular/core';
import {format, parse, ParsedNumber} from 'libphonenumber-js';

@Pipe({
  name: 'phone',
})
export class PhonePipe implements PipeTransform {
  transform(value: string, ...args) {

    if (!value) {
      return value;
    }
    // TODO take COUNTRY and FORMAT as arguments
    let parsed:ParsedNumber = parse(value, 'CA');
    return format(parsed, 'National');
  }
}
