import { Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer } from '@angular/core';

class Position {
  constructor(public x: number, public y: number) {
  }
}

@Directive({
  selector: '[ngDraggable]'
})
export class DragAndCheckDirective implements OnInit {
  private allowDrag: boolean = true;
  private moving: boolean = false;
  private original: Position = null;
  private oldTrans: Position = new Position(0, 0);
  private tempTrans: Position = new Position(0, 0);
  private currentTrans: Position = new Position(0, 0);
  private oldZIndex: string = '';
  private oldPosition: string = '';

  @Output() started = new EventEmitter<any>();
  @Output() stopped = new EventEmitter<any>();
  @Output() edge = new EventEmitter<any>();

  @Input() handle: HTMLElement;
  @Input() bounds: HTMLElement;
  @Input() allowedOffsets: Offsets = new Offsets();

  @Input()
  set ngDraggable(setting: any) {
    if (setting !== undefined && setting !== null && setting !== '') {
      this.allowDrag = !!setting;

      let element = this.handle ? this.handle : this.el.nativeElement;

      if (this.allowDrag) {
        this.renderer.setElementClass(element, 'ng-draggable', true);
      }
      else {
        this.renderer.setElementClass(element, 'ng-draggable', false);
      }
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer) {
  }

  ngOnInit() {
    if (this.allowDrag) {
      let element = this.handle ? this.handle : this.el.nativeElement;
      this.renderer.setElementClass(element, 'ng-draggable', true);
    }
  }
  private getPosition(x: number, y: number) {
    return new Position(x, y);
  }

  public moveTo(x: number, y: number) {
    if (this.original) {
      let element = this.el.nativeElement;
      this.tempTrans.x = x - this.original.x;
      this.tempTrans.y = y - this.original.y;
      this.verifyMoveOnX();
      this.verifyMoveOnY();
      let value = `translate(${this.tempTrans.x + this.oldTrans.x}px, ${this.tempTrans.y + this.oldTrans.y}px)`;
      this.renderer.setElementStyle(element, 'transform', value);
      this.renderer.setElementStyle(element, '-webkit-transform', value);
      this.renderer.setElementStyle(element, '-ms-transform', value);
      this.renderer.setElementStyle(element, '-moz-transform', value);
      this.renderer.setElementStyle(element, '-o-transform', value);
      this.edge.emit(this.boundsCheck());
      this.currentTrans = this.getPosition(this.tempTrans.x, this.tempTrans.y);
    }
  }

  public verifyMoveOnX() {

    let boundaries = this.el.nativeElement.getBoundingClientRect();
    let horizontalMove = this.tempTrans.x - this.currentTrans.x;

    let allowedLeftOffset = this.allowedOffsets.getLeft(this.el.nativeElement, this.handle);
    if (allowedLeftOffset != null &&
      horizontalMove < 0 &&
      boundaries.left + horizontalMove < allowedLeftOffset) {
      this.tempTrans.x = this.currentTrans.x - (boundaries.left - allowedLeftOffset);
    }
    let allowedRightOffset = this.allowedOffsets.getRight(this.el.nativeElement, this.handle);
    let windowWidth = document.documentElement.clientWidth;
    if (allowedRightOffset != null &&
      horizontalMove > 0 &&
      boundaries.right + horizontalMove > windowWidth - allowedRightOffset) {
      this.tempTrans.x = this.currentTrans.x + (windowWidth - allowedRightOffset - boundaries.right);
    }
  }

  public verifyMoveOnY() {
    let boundaries = this.el.nativeElement.getBoundingClientRect();
    let windowHeight = document.documentElement.clientHeight;
    let verticalMove = this.tempTrans.y - this.currentTrans.y;
    let allowedTopOffset = this.allowedOffsets.getTop(this.el.nativeElement, this.handle);

    if (allowedTopOffset != null &&
      verticalMove < 0 &&
      boundaries.top + verticalMove < allowedTopOffset) {
      this.tempTrans.y = this.currentTrans.y - (boundaries.top - allowedTopOffset);
    }

    let allowedBottomOffset = this.allowedOffsets.getBottom(this.el.nativeElement, this.handle);
    if (allowedBottomOffset != null &&
      verticalMove > 0 &&
      boundaries.bottom + verticalMove > windowHeight - allowedBottomOffset) {
      this.tempTrans.y = this.currentTrans.y + (windowHeight - allowedBottomOffset - boundaries.bottom);
    }
  }

  public pickUp() {
    // get old z-index and position:
    this.oldZIndex = this.el.nativeElement.style.zIndex ? this.el.nativeElement.style.zIndex : '';
    this.oldPosition = this.el.nativeElement.style.position ? this.el.nativeElement.style.position : '';
    this.getPosition(0, 0);
    if (window) {
      this.oldZIndex = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue('z-index');
      this.oldPosition = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue('position');
    }

    // setup default position:
    let position = 'relative';

    // check if old position is draggable:
    if (this.oldPosition && (
        this.oldPosition === 'absolute' ||
        this.oldPosition === 'fixed' ||
        this.oldPosition === 'relative')) {
      position = this.oldPosition;
    }

    this.renderer.setElementStyle(this.el.nativeElement, 'position', position);
    this.renderer.setElementStyle(this.el.nativeElement, 'z-index', '99999');

    if (!this.moving) {
      this.started.emit(this.el.nativeElement);
      this.moving = true;
    }
  }


  private boundsCheck() {
    if (!this.bounds) {
      return {
        'top': false,
        'right': false,
        'bottom': false,
        'left': false
      };
    }
    let boundary = this.bounds.getBoundingClientRect();
    let elem = this.el.nativeElement.getBoundingClientRect();
    return {
      'top': boundary.top < elem.top,
      'right': boundary.right > elem.right,
      'bottom': boundary.bottom > elem.bottom,
      'left': boundary.left < elem.left
    };
  }

  public putBack() {
    if (this.oldZIndex) {
      this.renderer.setElementStyle(this.el.nativeElement, 'z-index', this.oldZIndex);
    } else {
      this.el.nativeElement.style.removeProperty('z-index');
    }

    if (this.moving) {
      this.stopped.emit(this.el.nativeElement);
      this.edge.emit(this.boundsCheck());
      this.moving = false;
      this.oldTrans.x += this.tempTrans.x;
      this.oldTrans.y += this.tempTrans.y;
      this.tempTrans.x = this.tempTrans.y = 0;
    }
  }

  // Support Mouse Events:
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: any) {
    // 1. skip right click;
    // 2. if handle is set, the element can only be moved by handle
    if (event.button == 2 || (this.handle !== undefined && event.target !== this.handle)) {
      return;
    }

    this.original = this.getPosition(event.clientX, event.clientY);
    this.pickUp();
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.putBack();
  }

  @HostListener('document:mouseleave')
  onMouseLeave() {
    this.putBack();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: any) {
    if (this.moving && this.allowDrag) {
      this.moveTo(event.clientX, event.clientY);
    }
  }

  // Support Touch Events:
  @HostListener('document:touchend')
  onTouchEnd() {
    this.putBack();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: any) {
    event.stopPropagation();
    event.preventDefault();

    if (this.handle !== undefined && event.target !== this.handle) {
      return;
    }

    this.original = this.getPosition(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    this.pickUp();
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: any) {
    event.stopPropagation();
    event.preventDefault();
    if (this.moving && this.allowDrag) {
      this.moveTo(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
  }
}

export class Offsets {

  static NONE: string = 'none';
  static BORDER: string = 'border';
  static HALF_WIDTH: string = 'half';
  static HANDLE_HEIGHT: string = 'handle';

  constructor(private top: any = Offsets.NONE,
              private right: any = Offsets.NONE,
              private bottom: any = Offsets.NONE,
              private left: any = Offsets.NONE) {
  }


  getTop(el: HTMLElement, handle?: HTMLElement): number {

    return this.computeOffset(this.top, el,  handle);
  }

  getRight(el: HTMLElement, handle?: HTMLElement): number {
    return this.computeOffset(this.right, el,  handle);
  }

  getBottom(el: HTMLElement, handle?: HTMLElement): number {
    return this.computeOffset(this.bottom, el,  handle);
  }

  getLeft(el: HTMLElement, handle?: HTMLElement): number {
    return this.computeOffset(this.left, el,  handle);
  }

  computeOffset(value: any, el: HTMLElement, handle: HTMLElement): number {
    let result = null;
    if (!isNaN(+value)) {
      result = +value;
    } else {

      switch (value) {
        case Offsets.BORDER: {
          result = 0;
          break;
        }
        case Offsets.HALF_WIDTH: {
          result = this.computeHALF(el);
          break;
        }
        case Offsets.HALF_WIDTH: {
          result = this.computeHALF(el);
          break;
        }
        case Offsets.HANDLE_HEIGHT: {
          result = this.computeHANDLE(el, handle);
          break;
        }
        default : {
        }
      }
    }
    return result;
  }

  private computeHALF(el: HTMLElement): number {
    return -el.getBoundingClientRect().width / 2;
  }

  private computeHANDLE(el: HTMLElement, handle: HTMLElement): number {
    if(!handle){
      return 0;
    }
    let contentHeight = el.getBoundingClientRect().height;
    return handle.getBoundingClientRect().height - contentHeight;
  }
}
