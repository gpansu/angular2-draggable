# ng2-drag-and-check (https://www.npmjs.com/package/ng2-drag-and-check)
Angular directive (for version >= 2.x ) that makes the DOM element draggable, with additional checks on out of bounds elements. All credits should go to xieziyu for his ground work.

## Table of contents 
1. [Getting Started](#getting-started)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API](#api)
6. [Events](#events)

# Getting Started
ng2-drag-and-check is an angular (ver >= 2.x) directive that makes the DOM element draggable. (Note that: It's different from drag-and-drop)

# Latest Update
+ 2017.09.19: Fix an issue when dragging with touch.

+ 2017.08.26: Fix an issue: clicking before dragging leading to unexpected offset ([PR #12](https://github.com/xieziyu/angular2-draggable/pull/12) by [bmartinson13](https://github.com/bmartinson13))

+ 2017.07.24: Fix cross-browser compatibility issues.

+ 2017.07.05: Publish `UMD` bundle

# Installation
```
npm install angular2-draggable --save
```

# How to use it with:
+ `SystemJS`: For example: angular `quickstart`. You need to modify `systemjs.config.js` file just like:

```javascript
{
  map: {
    // ...

    // angular2-draggable
    'angular2-draggable':                   'npm:angular2-draggable',
  },
  packages: {
    // other packages ...

    //angular2-draggable
    'angular2-draggable': {
      defaultExtension: 'js',
      main: 'bundles/angular2-draggable.umd.min.js'
    }
  }
}
```

# Usage
Please refer to the [demo](https://xieziyu.github.io/#/angular2-draggable/demo) page.

1. Firstly, import `AngularDraggableModule` in your app module (or any other proper angular module):
    ```typescript
    import { DragAndCheckModule } from 'ng2-drag-and-check';

    @NgModule({
      imports: [
        ...,
        DragAndCheckModule
      ],
      ...
    })
    export class AppModule { }
    ```

2. Then: use `ngDraggable` directive to make the DOM element draggable.
    + Simple example:

      + html:
      ```html
      <div ngDraggable>Drag me!</div>
      ```

    + Use `[handle]` to move parent element:

      + html:
      ```html
      <div ngDraggable [handle]="DemoHandle" class="card">
        <div #DemoHandle class="card-header">I'm handle. Drag me!</div>
        <div class="card-block">You can't drag this block now!</div>
      </div>
      ```

# API

## Directive:
`ngDraggable` directive support following input properties:
+ `ngDraggable`: boolean. You can toggle the draggable capability by setting `true`/`false` to `ngDraggable`

+ `handle`: HTMLElement. Use template variable to refer to the handle element. Then only the handle element is draggable.

## CSS:
When `ngDraggable` is enabled on some element, `ng-draggable` class is automatically assigned to it. You can use it to customize the pointer style. For example:

```css
.ng-draggable {
  cursor: move;
}
```

# Events

Support `started` and `stopped` events. The `nativeElement` of the host would be emitted.

+ Simple example:
  + html:
  ```html
  <div ngDraggable (started)="onDragBegin($event)" (stopped)="onDragEnd($event)">Drag me!</div>
  ```
