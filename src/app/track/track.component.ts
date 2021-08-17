import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SpotifyPlayer } from 'src/common/classes/SpotifyPlayer';
import assignCss from 'src/common/fn/assignCss';
import { ISpotifyTrackAnalysis } from 'src/services/spotify.service';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit, OnDestroy {
  private get frameDurationMs() { return this.viewportTimeMs * this.FRAME_SIZE; }
  private get frameHeightPx() { return this.viewportHeightPx * this.FRAME_SIZE; }
  private get viewportHeightPx() { return this.getTrack().clientHeight; }
  private get viewportWidthPx() { return this.getTrack().clientWidth; }
  constructor(private elementRef: ElementRef) {
    Object.assign(window, { track: this });
  }
  public isEditMode = true;
  public isDevMode = false;
  public notesBetweenBeats = 1;
  public inputThresholdMs = 150;
  public viewportTimeMs = 5000; // Viewport height is a 5 second distance
  private readonly FRAME_SIZE = 2; // 2x viewport duration
  private isPanning = false;
  private panStartY!: number;
  private panStartMs!: number;
  @Output() public delayMs = new EventEmitter<number>();
  @HostBinding('tabindex') public tabindex = 0;
  private spacePressedAt?: number;
  @Input() public player!: SpotifyPlayer;
  @Input() public analysis!: ISpotifyTrackAnalysis;
  private nowEl = document.createElement('div');
  private isDead = false;
  private frameResuestId?: number;
  private frameStack = [] as IRenderFrame[];
  private lastPositionMs?: number;
  @HostListener('keydown.space')
  public onSpacePressed() {
    this.spacePressedAt = Date.now();
    this.processSpacePress();
  }
  public onScroll(event: Event) {
    const deltaMs = .15 * this.viewportTimeMs;

    if (this.lastPositionMs !== undefined) {
      if ((event as WheelEvent).deltaY > 0) {
        this.player.seek(this.lastPositionMs + deltaMs);
      } else {
        this.player.seek(this.lastPositionMs - deltaMs);
      }
    }
  }
  public onMouseDown(event: MouseEvent) {
    if (this.lastPositionMs !== undefined) {
      this.isPanning = true;
      this.panStartY = event.clientY;
      this.panStartMs = this.lastPositionMs;
    }
  }
  public onMouseUp() {
    this.isPanning = false;
    if (this.lastPositionMs !== undefined) {
      this.player.seek(this.lastPositionMs);
    }
  }
  public onMouseMove(event: MouseEvent) {
    if (this.isPanning && this.lastPositionMs !== undefined) {
      const deltaPx = event.clientY - this.panStartY;
      const deltaMs = this.pxToMs(deltaPx);
      this.lastPositionMs = this.panStartMs + deltaMs;
    }
  }
  public async initMIDIInput() {
    const access = await (navigator as any).requestMIDIAccess();
    const inputs = [...access.inputs.values()];
    console.log(inputs);
    inputs[0]?.addEventListener('midimessage', (message: any) => {
      if (message.data[0] === 254) {
        return;
      }

      if (
        message.data[1] === 41
      ) {
        this.onSpacePressed();
      }

      console.log(message.data);
    });
  }
  public getTrack() {
    return this.elementRef.nativeElement.children[0] as HTMLDivElement;
  }
  public ngOnDestroy(): void {
    this.isDead = true;

    if (this.frameResuestId !== undefined) {
      cancelAnimationFrame(this.frameResuestId);
    }
  }
  public ngOnInit(): void {
    this.addNowBar();
    this.initMIDIInput();
    this.loop();
  }
  public addNowBar() {
    assignCss(this.nowEl, {
      height: '1px',
      width: '100%',
      background: 'gray',
      position: 'absolute',
      left: '0',
      zIndex: '1',
      top: '75%'
    });

    this.getTrack().append(this.nowEl);
  }
  public async processSpacePress() {
    if (this.spacePressedAt && this.player.trackId) {
      const spacePressAgoMs = Date.now() - this.spacePressedAt;
      const { duration: durationMs, position: positionMs } = await this.player.getCurrentState();
      const spacePressPositionMs = positionMs - spacePressAgoMs;
      const minMs = spacePressPositionMs - this.inputThresholdMs;
      const maxMs = spacePressPositionMs + this.inputThresholdMs;

      for (const beat of this.analysis.beats) {
        const beatStartMs = beat.start * 1e3;
        if (beatStartMs < maxMs && beatStartMs > minMs) {
          const index = this.analysis.beats.indexOf(beat);
          const beatEl = document.getElementById(`beat_${index}`);

          if (beatEl) {
            beatEl.style.background = 'green';
          }

          const delayMs = beatStartMs - spacePressPositionMs;
          this.delayMs.emit(delayMs);

          break;
        }
      }

      console.log('processed', spacePressPositionMs, positionMs);
      this.spacePressedAt = undefined;
    }
  }
  public loop() {
    this.frameResuestId = requestAnimationFrame(async (time) => {
      const state = this.isPanning ? { position: this.lastPositionMs as number } : await this.player.getCurrentState();

      if (state) {
        const { position: positionMs } = state;

        // On pause, it does like +150ms and on resume -150ms, which causes visible hops
        // if (this.lastPositionMs !== undefined) {
        //   const deltaMs = positionMs - this.lastPositionMs;
        //   if (deltaMs < 0 && !this.isDead) {
        //     return this.loop();
        //   }
        // }

        this.lastPositionMs = positionMs;

        this.removeNewestFramesIfNeeded(positionMs);
        this.removeOldestFramesIfNeeded(positionMs);
        this.updateFramePositions(positionMs);
        this.pushNextFrameIfNeeded(positionMs);
      }

      if (!this.isDead) {
        this.loop();
      }
    });
  }
  public removeFrames() {
    [...this.frameStack].forEach(this.removeFrame.bind(this));
  }
  public removeNewestFramesIfNeeded(currentPositionMs: number) {
    const frameThatContainsNow = this.getFrameAtPosition(currentPositionMs);

    if (!frameThatContainsNow) {
      this.removeFrames();
    }
  }
  public getFrameAtPosition(positionMs: number) {
    return this.frameStack.find(o => o.startPositionMs <= positionMs && o.startPositionMs + this.frameDurationMs >= positionMs);
  }
  public updateFramePositions(currentPositionMs: number) {
    for (const frame of this.frameStack) {
      const topPx = this.calculateFrameTopPx(frame.startPositionMs, currentPositionMs);
      assignCss(frame.element, { top: `${topPx}px` });
    }
  }
  public calculateFrameTopPx(frameStartPositionMs: number, currentPositionMs: number) {
    const fromNowMs = frameStartPositionMs - currentPositionMs;
    const fromNowPx = this.msToPx(fromNowMs);
    return this.viewportHeightPx - this.frameHeightPx - fromNowPx - (this.viewportHeightPx * .25);
  }
  public msToPx(ms: number) {
    const pxpms = this.viewportHeightPx / this.viewportTimeMs;
    return ms * pxpms;
  }
  public pxToMs(px: number) {
    const msppx = this.viewportTimeMs / this.viewportHeightPx;
    return px * msppx;
  }
  public removeOldestFramesIfNeeded(currentPositionMs: number) {
    const firstFrame = this.frameStack[0];

    if (firstFrame?.startPositionMs < currentPositionMs - this.frameDurationMs * this.FRAME_SIZE) {
      this.removeFrame(firstFrame);
      this.removeOldestFramesIfNeeded(currentPositionMs);
    }
  }
  public removeFrame(frame: IRenderFrame) {
    frame.element.remove();
    this.frameStack.splice(this.frameStack.indexOf(frame), 1);
  }
  public pushNextFrameIfNeeded(currentPositionMs: number) {
    const lastFrame = this.frameStack[this.frameStack.length - 1];

    if (!lastFrame || lastFrame.startPositionMs < currentPositionMs) {
      this.pushNextFrame(currentPositionMs);
    }
  }
  public isOverlap(x: [number, number], y: [number, number]) {
    return x[0] <= y[1] && y[0] <= x[1];
  }
  public pushNextFrame(currentPositionMs: number) {
    const startPositionMs = this.getNextFrameStartPositionMs(currentPositionMs);
    const endPositionMs = startPositionMs + this.frameDurationMs;
    const element = document.createElement('div');
    const topPx = this.calculateFrameTopPx(startPositionMs, currentPositionMs);

    element.setAttribute('start', startPositionMs.toString());
    element.setAttribute('end', endPositionMs.toString());

    assignCss(element, {
      position: 'absolute',
      height: `${this.frameHeightPx}px`,
      boxShadow: this.isDevMode ? 'inset 0 0 0 1px black' : 'none',
      width: '100%',
      top: `${topPx}px`,
      left: '0'
    });

    const frame = { startPositionMs, endPositionMs, element };

    this.addBeats(frame);

    // this.addSegmentCanvas(frame);

    this.frameStack.push(frame);
    this.getTrack().appendChild(element);
  }
  public addSegmentCanvas(frame: IRenderFrame) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.width = this.viewportWidthPx;
    canvas.height = this.frameHeightPx;

    for (const segment of this.analysis.segments) {
      const startMs = segment.start * 1e3;
      const durationMs = segment.duration * 1e3;
      const endMs = startMs + durationMs;

      if (this.isOverlap([frame.startPositionMs, frame.endPositionMs], [startMs, endMs])) {
        // Paint segment
        const index = this.analysis.segments.indexOf(segment);
        const relativeSegmentStartMs = frame.endPositionMs - startMs;
        const relativeSegmentEndMs = frame.endPositionMs - endMs;
        const MAGNIFICATION = 3;
        const loudnessMaxPx = (+segment.loudness_max.toFixed(0) + 60);
        const loudnessStartPx = (+segment.loudness_start.toFixed(0) + 60);
        const topPx = this.msToPx(relativeSegmentEndMs);
        const endPx = this.msToPx(relativeSegmentStartMs);
        const heightPx = endPx - topPx;
        ctx.fillStyle = '#1a2439';
        ctx.strokeStyle = 'black';

        ctx.fillRect(0, topPx, loudnessStartPx, heightPx);

        // Stroke max
        {
          const maxDurationMs = 40;
          const maxStartPositionMs = relativeSegmentStartMs + (segment.loudness_max_time * 1e3);
          const maxEndPositionMs = relativeSegmentEndMs; // maxStartPositionMs + maxDurationMs;
          const maxTopPx = this.msToPx(maxStartPositionMs);
          const maxEndPx = this.msToPx(maxEndPositionMs);
          const maxHeightPx = maxEndPx - maxTopPx;
          ctx.fillRect(0, maxTopPx, loudnessMaxPx, maxHeightPx);
        }

        ctx.fillStyle = 'white';
        ctx.fillText(loudnessStartPx.toString() + ` (${index})`, loudnessMaxPx, topPx + 10);
      }
    }

    assignCss(canvas, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' });
    frame.element.prepend(canvas);
  }
  public addBeats(frame: IRenderFrame) {
    for (const beat of this.analysis.beats) {
      const index = this.analysis.beats.indexOf(beat);
      const beatStartMs = beat.start * 1e3;
      if (beatStartMs < frame.startPositionMs) {
        continue;
      } else if (beatStartMs >= frame.startPositionMs && beatStartMs < frame.startPositionMs + this.frameDurationMs) {
        const relativeBeatStartMs = beatStartMs - frame.startPositionMs;
        const beatStartPx = this.frameHeightPx - this.msToPx(relativeBeatStartMs);
        const lineEl = this.createLineElement({
          color: '#202d49',
          topPx: beatStartPx,
          id: `beat_${index}`,
          css: { height: '2px' }
        });
        lineEl.setAttribute('start', beatStartMs.toString());
        frame.element.appendChild(lineEl);
        if (index && this.isEditMode) {
          const prevBeat = this.analysis.beats[index - 1];
          const beatWindow = {
            relativeStartMs: (prevBeat.start * 1e3) - frame.startPositionMs,
            relativeEndMs: (beat.start * 1e3) - frame.startPositionMs,
            get durationMs() { return beatWindow.relativeEndMs - beatWindow.relativeStartMs; }
          };
          const divisions = this.notesBetweenBeats + 1;
          const lineIntervalMs = beatWindow.durationMs / divisions;
          let editLines = divisions;
          while (editLines--) {
            const relativeEditLineStartMs = beatWindow.relativeStartMs + (lineIntervalMs * (editLines + 1));
            const editLineStartPx = this.frameHeightPx - this.msToPx(relativeEditLineStartMs);
            const editLineEl = this.createLineElement({
              color: '#1a2439',
              topPx: editLineStartPx,
              classes: ['flex', 'flex-row', 'justify-center', 'gap-6']
            });

            for (const note of [
              { color: '#202d49', width: '3%' },
              { color: 'red', width: '10%' },
              { color: 'yellow', width: '10%' },
              { color: 'blue', width: '10%' },
              { color: 'green', width: '10%' }
            ]) {
              const noteEl = document.createElement('div');
              noteEl.classList.add('rounded-full', 'opacity-10', 'hover:opacity-75', 'cursor-pointer');
              assignCss(noteEl, {
                width: note.width,
                height: '20px',
                marginTop: '-10px',
                background: note.color
              });
              noteEl.addEventListener('click', () => {
                noteEl.style.opacity = noteEl.style.opacity === '1' ? '' : '1';
              });
              editLineEl.appendChild(noteEl);
            }

            editLineEl.setAttribute('start', relativeEditLineStartMs.toString());
            frame.element.appendChild(editLineEl);
          }
        }
      } else {
        break;
      }
    }
  }
  public getNextFrameStartPositionMs(currentPositionMs: number) {
    const lastFrame = this.frameStack[this.frameStack.length - 1];
    let startPositionMs = currentPositionMs - (this.viewportTimeMs * .25);

    if (lastFrame) {
      startPositionMs = lastFrame.startPositionMs + this.frameDurationMs + 1;
    }

    return startPositionMs;
  }
  public createLineElement(options: {
    color: string;
    topPx: number;
    id?: string;
    classes?: string[];
    css?: Partial<CSSStyleDeclaration>
  }) {
    const element = document.createElement('div');

    if (this.isDevMode) {
      element.innerHTML = options.id || '';
    }

    element.id = options.id || '';

    if (options.classes) {
      element.classList.add(...options.classes);
    }

    assignCss(element, {
      height: '1px',
      width: '100%',
      background: options.color,
      position: 'absolute',
      left: '0',
      top: `${options.topPx}px`,
      ...options.css
    });

    return element;
  }
}

interface IRenderFrame {
  startPositionMs: number;
  endPositionMs: number;
  element: HTMLDivElement;
}
