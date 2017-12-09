import { NgModule } from '@angular/core';

import { DragAndCheckDirective, Offsets } from './directive/drag-and-check.directive';
export * from './directive/drag-and-check.directive';

@NgModule({
  declarations: [
    DragAndCheckDirective,
    Offsets
  ],
  exports: [
    DragAndCheckDirective,
    Offsets
  ]
})
export class DragAndCheckModule {
}
