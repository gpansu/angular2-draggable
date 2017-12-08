"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Position = (function () {
    function Position(x, y) {
        this.x = x;
        this.y = y;
    }
    return Position;
}());
var DragAndCheckDirective = (function () {
    function DragAndCheckDirective(el, renderer) {
        this.el = el;
        this.renderer = renderer;
        this.allowDrag = true;
        this.moving = false;
        this.original = null;
        this.oldTrans = new Position(0, 0);
        this.tempTrans = new Position(0, 0);
        this.currentTrans = new Position(0, 0);
        this.oldZIndex = '';
        this.oldPosition = '';
        this.started = new core_1.EventEmitter();
        this.stopped = new core_1.EventEmitter();
        this.edge = new core_1.EventEmitter();
        this.allowedOffsets = new Offsets();
    }
    Object.defineProperty(DragAndCheckDirective.prototype, "ngDraggable", {
        set: function (setting) {
            if (setting !== undefined && setting !== null && setting !== '') {
                this.allowDrag = !!setting;
                var element = this.handle ? this.handle : this.el.nativeElement;
                if (this.allowDrag) {
                    this.renderer.setElementClass(element, 'ng-draggable', true);
                }
                else {
                    this.renderer.setElementClass(element, 'ng-draggable', false);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    DragAndCheckDirective.prototype.ngOnInit = function () {
        if (this.allowDrag) {
            var element = this.handle ? this.handle : this.el.nativeElement;
            this.renderer.setElementClass(element, 'ng-draggable', true);
        }
    };
    DragAndCheckDirective.prototype.getPosition = function (x, y) {
        return new Position(x, y);
    };
    DragAndCheckDirective.prototype.moveTo = function (x, y) {
        if (this.original) {
            var element = this.el.nativeElement;
            this.tempTrans.x = x - this.original.x;
            this.tempTrans.y = y - this.original.y;
            this.verifyMoveOnX();
            this.verifyMoveOnY();
            var value = "translate(" + (this.tempTrans.x + this.oldTrans.x) + "px, " + (this.tempTrans.y + this.oldTrans.y) + "px)";
            this.renderer.setElementStyle(element, 'transform', value);
            this.renderer.setElementStyle(element, '-webkit-transform', value);
            this.renderer.setElementStyle(element, '-ms-transform', value);
            this.renderer.setElementStyle(element, '-moz-transform', value);
            this.renderer.setElementStyle(element, '-o-transform', value);
            this.edge.emit(this.boundsCheck());
            this.currentTrans = this.getPosition(this.tempTrans.x, this.tempTrans.y);
        }
    };
    DragAndCheckDirective.prototype.verifyMoveOnX = function () {
        var boundaries = this.el.nativeElement.getBoundingClientRect();
        var horizontalMove = this.tempTrans.x - this.currentTrans.x;
        var allowedLeftOffset = this.allowedOffsets.getLeft(this.el.nativeElement, this.handle);
        if (allowedLeftOffset != null &&
            horizontalMove < 0 &&
            boundaries.left + horizontalMove < allowedLeftOffset) {
            this.tempTrans.x = this.currentTrans.x - (boundaries.left - allowedLeftOffset);
        }
        var allowedRightOffset = this.allowedOffsets.getRight(this.el.nativeElement, this.handle);
        var windowWidth = document.documentElement.clientWidth;
        if (allowedRightOffset != null &&
            horizontalMove > 0 &&
            boundaries.right + horizontalMove > windowWidth - allowedRightOffset) {
            this.tempTrans.x = this.currentTrans.x + (windowWidth - allowedRightOffset - boundaries.right);
        }
    };
    DragAndCheckDirective.prototype.verifyMoveOnY = function () {
        var boundaries = this.el.nativeElement.getBoundingClientRect();
        var windowHeight = document.documentElement.clientHeight;
        var verticalMove = this.tempTrans.y - this.currentTrans.y;
        var allowedTopOffset = this.allowedOffsets.getTop(this.el.nativeElement, this.handle);
        if (allowedTopOffset != null &&
            verticalMove < 0 &&
            boundaries.top + verticalMove < allowedTopOffset) {
            this.tempTrans.y = this.currentTrans.y - (boundaries.top - allowedTopOffset);
        }
        var allowedBottomOffset = this.allowedOffsets.getBottom(this.el.nativeElement, this.handle);
        if (allowedBottomOffset != null &&
            verticalMove > 0 &&
            boundaries.bottom + verticalMove > windowHeight - allowedBottomOffset) {
            this.tempTrans.y = this.currentTrans.y + (windowHeight - allowedBottomOffset - boundaries.bottom);
        }
    };
    DragAndCheckDirective.prototype.pickUp = function () {
        // get old z-index and position:
        this.oldZIndex = this.el.nativeElement.style.zIndex ? this.el.nativeElement.style.zIndex : '';
        this.oldPosition = this.el.nativeElement.style.position ? this.el.nativeElement.style.position : '';
        this.getPosition(0, 0);
        if (window) {
            this.oldZIndex = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue('z-index');
            this.oldPosition = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue('position');
        }
        // setup default position:
        var position = 'relative';
        // check if old position is draggable:
        if (this.oldPosition && (this.oldPosition === 'absolute' ||
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
    };
    DragAndCheckDirective.prototype.boundsCheck = function () {
        if (!this.bounds) {
            return {
                'top': false,
                'right': false,
                'bottom': false,
                'left': false
            };
        }
        var boundary = this.bounds.getBoundingClientRect();
        var elem = this.el.nativeElement.getBoundingClientRect();
        return {
            'top': boundary.top < elem.top,
            'right': boundary.right > elem.right,
            'bottom': boundary.bottom > elem.bottom,
            'left': boundary.left < elem.left
        };
    };
    DragAndCheckDirective.prototype.putBack = function () {
        if (this.oldZIndex) {
            this.renderer.setElementStyle(this.el.nativeElement, 'z-index', this.oldZIndex);
        }
        else {
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
    };
    // Support Mouse Events:
    DragAndCheckDirective.prototype.onMouseDown = function (event) {
        // 1. skip right click;
        // 2. if handle is set, the element can only be moved by handle
        if (event.button == 2 || (this.handle !== undefined && event.target !== this.handle)) {
            return;
        }
        this.original = this.getPosition(event.clientX, event.clientY);
        this.pickUp();
    };
    DragAndCheckDirective.prototype.onMouseUp = function () {
        this.putBack();
    };
    DragAndCheckDirective.prototype.onMouseLeave = function () {
        this.putBack();
    };
    DragAndCheckDirective.prototype.onMouseMove = function (event) {
        if (this.moving && this.allowDrag) {
            this.moveTo(event.clientX, event.clientY);
        }
    };
    // Support Touch Events:
    DragAndCheckDirective.prototype.onTouchEnd = function () {
        this.putBack();
    };
    DragAndCheckDirective.prototype.onTouchStart = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.handle !== undefined && event.target !== this.handle) {
            return;
        }
        this.original = this.getPosition(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        this.pickUp();
    };
    DragAndCheckDirective.prototype.onTouchMove = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.moving && this.allowDrag) {
            this.moveTo(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        }
    };
    return DragAndCheckDirective;
}());
__decorate([
    core_1.Output()
], DragAndCheckDirective.prototype, "started", void 0);
__decorate([
    core_1.Output()
], DragAndCheckDirective.prototype, "stopped", void 0);
__decorate([
    core_1.Output()
], DragAndCheckDirective.prototype, "edge", void 0);
__decorate([
    core_1.Input()
], DragAndCheckDirective.prototype, "handle", void 0);
__decorate([
    core_1.Input()
], DragAndCheckDirective.prototype, "bounds", void 0);
__decorate([
    core_1.Input()
], DragAndCheckDirective.prototype, "allowedOffsets", void 0);
__decorate([
    core_1.Input()
], DragAndCheckDirective.prototype, "ngDraggable", null);
__decorate([
    core_1.HostListener('mousedown', ['$event'])
], DragAndCheckDirective.prototype, "onMouseDown", null);
__decorate([
    core_1.HostListener('document:mouseup')
], DragAndCheckDirective.prototype, "onMouseUp", null);
__decorate([
    core_1.HostListener('document:mouseleave')
], DragAndCheckDirective.prototype, "onMouseLeave", null);
__decorate([
    core_1.HostListener('document:mousemove', ['$event'])
], DragAndCheckDirective.prototype, "onMouseMove", null);
__decorate([
    core_1.HostListener('document:touchend')
], DragAndCheckDirective.prototype, "onTouchEnd", null);
__decorate([
    core_1.HostListener('touchstart', ['$event'])
], DragAndCheckDirective.prototype, "onTouchStart", null);
__decorate([
    core_1.HostListener('document:touchmove', ['$event'])
], DragAndCheckDirective.prototype, "onTouchMove", null);
DragAndCheckDirective = __decorate([
    core_1.Directive({
        selector: '[ngDraggable]'
    })
], DragAndCheckDirective);
exports.DragAndCheckDirective = DragAndCheckDirective;
var Offsets = (function () {
    function Offsets(top, right, bottom, left) {
        if (top === void 0) { top = Offsets.NONE; }
        if (right === void 0) { right = Offsets.NONE; }
        if (bottom === void 0) { bottom = Offsets.NONE; }
        if (left === void 0) { left = Offsets.NONE; }
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    Offsets.prototype.getTop = function (el, handle) {
        return this.computeOffset(this.top, el, handle);
    };
    Offsets.prototype.getRight = function (el, handle) {
        return this.computeOffset(this.right, el, handle);
    };
    Offsets.prototype.getBottom = function (el, handle) {
        return this.computeOffset(this.bottom, el, handle);
    };
    Offsets.prototype.getLeft = function (el, handle) {
        return this.computeOffset(this.left, el, handle);
    };
    Offsets.prototype.computeOffset = function (value, el, handle) {
        var result = null;
        if (!isNaN(+value)) {
            result = +value;
        }
        else {
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
                default: {
                }
            }
        }
        return result;
    };
    Offsets.prototype.computeHALF = function (el) {
        return -el.getBoundingClientRect().width / 2;
    };
    Offsets.prototype.computeHANDLE = function (el, handle) {
        if (!handle) {
            return 0;
        }
        var contentHeight = el.getBoundingClientRect().height;
        return handle.getBoundingClientRect().height - contentHeight;
    };
    return Offsets;
}());
Offsets.NONE = 'none';
Offsets.BORDER = 'border';
Offsets.HALF_WIDTH = 'half';
Offsets.HANDLE_HEIGHT = 'handle';
exports.Offsets = Offsets;
