import { Directive, ElementRef, effect, inject, input } from '@angular/core';

@Directive({ selector: '[appStream]', standalone: true })
export class StreamDirective {
  private el = inject(ElementRef<HTMLVideoElement>);
  readonly appStream = input<MediaStream | null>(null);

  constructor() {
    effect(() => {
      const stream = this.appStream();
      if (stream) this.el.nativeElement.srcObject = stream;
    });
  }
}
