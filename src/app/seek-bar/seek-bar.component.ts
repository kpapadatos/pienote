import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-seek-bar',
  templateUrl: './seek-bar.component.html',
  styleUrls: ['./seek-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeekBarComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter();
  constructor(private elementRef: ElementRef) { }
  @HostListener('click', ['$event'])
  seekStart(event: MouseEvent) {
    this.seek(event.offsetX);
  }
  seek(xPx: number) {
    const maxPx = this.elementRef.nativeElement.clientWidth;
    this.value = xPx / maxPx;
    this.valueChange.emit(this.value);
  }
}
