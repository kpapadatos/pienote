import { ElementRef, Directive, OnInit, Input, OnChanges } from '@angular/core';
import { AnimationBuilder, style, animate, AnimationPlayer } from '@angular/animations';
@Directive({ selector: '[appMetronomeLine]' })
export class MetronomeLineDirective implements OnInit, OnChanges {
    @Input() deadlineTop: number;
    @Input() visibleTimelineMs: number;
    @Input() timeToDeadlineMs: number;
    @Input() isPlaying = false;
    constructor(public elementRef: ElementRef, private builder: AnimationBuilder) { }
    animationPlayer: AnimationPlayer;
    animateIndefinately() {
        const timeToDeadlineVisibleMs = this.visibleTimelineMs / (this.deadlineTop / 100);
        // 0 deadlineTop
        // visibleTimelineMs 100
        // visibleTimelineMs+timeToDeadlineMs x

        const factory = this.builder.build([
            style({ top: (this.deadlineTop - 100 * (this.timeToDeadlineMs / timeToDeadlineVisibleMs)) + '%' }),
            animate(this.timeToDeadlineMs / (this.deadlineTop / 100), style({ top: '100%' }))
        ]);
        this.animationPlayer = factory.create(this.elementRef.nativeElement, {});
        this.animationPlayer.onDone(() => {
            this.timeToDeadlineMs = this.visibleTimelineMs;
            this.animationPlayer.destroy();
            this.animateIndefinately();

            if (this.isPlaying) {
                this.animationPlayer.play();
            }
        });

        if (this.isPlaying) {
            this.animationPlayer.play();
        }
    }
    ngOnInit() {
        this.animateIndefinately();
    }
    ngOnChanges() {
        if (this.animationPlayer) {
            if (this.isPlaying) {
                this.animationPlayer.play();
            } else {
                this.animationPlayer.pause();
            }
        }
    }
}
