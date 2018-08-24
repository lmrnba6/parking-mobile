import {NgModule} from '@angular/core';
import {PhonePipe} from './phone/phone.pipe';
import {DurationPipe} from './duration/duration';

@NgModule({
  declarations: [PhonePipe,
    DurationPipe],
  imports: [],
  exports: [PhonePipe,
    DurationPipe]
})
export class PipesModule {}
