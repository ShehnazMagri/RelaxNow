import { ElementRef, HostListener, Input } from '@angular/core';
import { Directive } from '@angular/core';

@Directive({
  selector: '[appInputrestriction]',
})
export class InputrestrictionDirective {
  @Input('appInputrestriction') condition: string;

  private element: ElementRef;

  constructor(element: ElementRef) {
    this.element = element;
  }

  @HostListener('keypress', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    const regex = new RegExp(this.condition);
    const str = String.fromCharCode(
      !event.charCode ? event.which : event.charCode
    );
    console.log(str)

    if (regex.test(str)) {
      return true;
    }

    event.preventDefault();
    return false;
  }
}
