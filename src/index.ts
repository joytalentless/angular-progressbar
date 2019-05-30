import {NgModule} from '@angular/core';

import {RoundProgressComponent} from './round-progress.component';
import {RoundProgressEase} from './round-progress.ease';
import {ROUND_PROGRESS_DEFAULTS_PROVIDER} from './round-progress.config';

@NgModule({
  declarations: [RoundProgressComponent],
  exports: [RoundProgressComponent],
  providers: [RoundProgressEase, ROUND_PROGRESS_DEFAULTS_PROVIDER]
})
export class RoundProgressModule {}

export * from './round-progress.component';
export * from './round-progress.service';
export * from './round-progress.ease';
export * from './round-progress.config';
