import { NgModule } from '@angular/core';

import { DragAndCheckDirective } from './directive/drag-and-check.directive';

export * from './directive/drag-and-check.directive';

@NgModule({
  declarations: [
    DragAndCheckDirective
  ],
  exports: [
    DragAndCheckDirective
  ]
})
export class DragAndCheckModule {
}
