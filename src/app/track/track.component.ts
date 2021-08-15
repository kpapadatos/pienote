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
  private static readonly VIEWPORT_TIME_MS = 5000; // Viewport height is a 5 second distance
  private static readonly FRAME_SIZE = 2; // 2x viewport duration
  private static readonly frameDurationMs = TrackComponent.VIEWPORT_TIME_MS * TrackComponent.FRAME_SIZE;
  private get frameHeightPx() { return this.viewportHeightPx * TrackComponent.FRAME_SIZE };
  private get viewportHeightPx() { return this.getTrack().clientHeight; };
  @Output() delayMs = new EventEmitter<number>();
  @HostBinding('tabindex') tabindex = 0;
  @HostListener('keydown.space')
  onSpacePressed() {
    this.spacePressedAt = Date.now();
    this.processSpacePress();
  }
  private spacePressedAt?: number;
  @Input() player!: SpotifyPlayer;
  @Input() analysis!: ISpotifyTrackAnalysis;
  private nowEl = document.createElement('div');
  private isDead = false;
  private frameResuestId?: number;
  private frameStack = [] as IRenderFrame[];
  private lastPositionMs?: number;
  constructor(private elementRef: ElementRef) {
    Object.assign(window, { track: this });
  }
  async initMIDIInput() {
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
    })
  }
  getTrack() {
    return this.elementRef.nativeElement.children[0] as HTMLDivElement;
  }
  ngOnDestroy(): void {
    this.isDead = true;

    if (this.frameResuestId !== undefined) {
      cancelAnimationFrame(this.frameResuestId);
    }
  }
  ngOnInit(): void {
    this.addNowBar();
    this.initMIDIInput();
    this.loop();
  }
  addNowBar() {
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
  async processSpacePress() {
    const THRESHOLD_MS = 150;
    if (this.spacePressedAt && this.player.trackId) {
      const spacePressAgoMs = Date.now() - this.spacePressedAt;
      const { duration: durationMs, position: positionMs } = await this.player.getCurrentState();
      const spacePressPositionMs = positionMs - spacePressAgoMs;
      const minMs = spacePressPositionMs - THRESHOLD_MS;
      const maxMs = spacePressPositionMs + THRESHOLD_MS;

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

      console.log('processed', spacePressPositionMs, positionMs)
      this.spacePressedAt = undefined;
    }
  }
  loop() {
    this.frameResuestId = requestAnimationFrame(async (time) => {
      const state = await this.player.getCurrentState();

      if (state) {
        const { duration: durationMs, position: positionMs } = state;

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
  removeNewestFramesIfNeeded(currentPositionMs: number) {
    const frameThatContainsNow = this.getFrameAtPosition(currentPositionMs);

    if (!frameThatContainsNow) {
      [...this.frameStack].forEach(this.removeFrame.bind(this));
    }
  }
  getFrameAtPosition(positionMs: number) {
    return this.frameStack.find(o => o.startPositionMs <= positionMs && o.startPositionMs + TrackComponent.frameDurationMs >= positionMs);
  }
  updateFramePositions(currentPositionMs: number) {
    for (const frame of this.frameStack) {
      const topPx = this.calculateFrameTopPx(frame.startPositionMs, currentPositionMs);
      assignCss(frame.element, { top: `${topPx}px` });
    }
  }
  calculateFrameTopPx(frameStartPositionMs: number, currentPositionMs: number) {
    const viewportHeightPx = this.getTrack().clientHeight;
    const fromNowMs = frameStartPositionMs - currentPositionMs;
    const fromNowPx = this.msToPx(fromNowMs);
    return viewportHeightPx - this.frameHeightPx - fromNowPx - (viewportHeightPx * .25);
  }
  msToPx(ms: number) {
    const viewportHeightPx = this.getTrack().clientHeight;
    const pxpms = viewportHeightPx / TrackComponent.VIEWPORT_TIME_MS;
    return ms * pxpms;
  }
  removeOldestFramesIfNeeded(currentPositionMs: number) {
    const firstFrame = this.frameStack[0];

    if (firstFrame?.startPositionMs < currentPositionMs - TrackComponent.frameDurationMs * TrackComponent.FRAME_SIZE) {
      this.removeFrame(firstFrame);
      this.removeOldestFramesIfNeeded(currentPositionMs);
    }
  }
  removeFrame(frame: IRenderFrame) {
    frame.element.remove();
    this.frameStack.splice(this.frameStack.indexOf(frame), 1);
  }
  pushNextFrameIfNeeded(currentPositionMs: number) {
    const lastFrame = this.frameStack[this.frameStack.length - 1];

    if (!lastFrame || lastFrame.startPositionMs < currentPositionMs) {
      this.pushNextFrame(currentPositionMs);
    }
  }
  pushNextFrame(currentPositionMs: number) {
    const viewportHeightPx = this.getTrack().clientHeight;
    const startPositionMs = this.getNextFrameStartPositionMs(currentPositionMs);
    const element = document.createElement('div');
    const topPx = this.calculateFrameTopPx(startPositionMs, currentPositionMs);

    element.setAttribute('start', startPositionMs.toString());
    element.setAttribute('end', (startPositionMs + TrackComponent.frameDurationMs).toString())

    assignCss(element, {
      position: 'absolute',
      height: `${viewportHeightPx * TrackComponent.FRAME_SIZE}px`,
      boxShadow: 'inset 0 0 0 1px black',
      width: '100%',
      top: `${topPx}px`,
      left: '0'
    });

    const frame = { startPositionMs, element };

    this.addBeats(frame);

    this.frameStack.push(frame);
    this.getTrack().appendChild(element);
  }
  addBeats(frame: TrackComponent['frameStack'][number]) {
    for (const beat of this.analysis.beats) {
      const index = this.analysis.beats.indexOf(beat);
      const beatStartMs = beat.start * 1e3;
      if (beatStartMs < frame.startPositionMs) {
        continue;
      } else if (beatStartMs >= frame.startPositionMs && beatStartMs < frame.startPositionMs + TrackComponent.frameDurationMs) {
        const relativeBeatStartMs = beatStartMs - frame.startPositionMs;
        const beatStartPx = this.frameHeightPx - this.msToPx(relativeBeatStartMs);
        const lineEl = this.createLineElement('#202d49', beatStartPx, `beat_${index}`);
        lineEl.setAttribute('start', beatStartMs.toString());
        frame.element.appendChild(lineEl);
      } else {
        break;
      }
    }
  }
  getNextFrameStartPositionMs(currentPositionMs: number) {
    const lastFrame = this.frameStack[this.frameStack.length - 1];
    let startPositionMs = currentPositionMs;

    if (lastFrame) {
      startPositionMs = lastFrame.startPositionMs + TrackComponent.frameDurationMs + 1;
    }

    return startPositionMs;
  }
  createLineElement(color: string, topPx: number, id: string = '') {
    const element = document.createElement('div');

    element.id = id;

    assignCss(element, {
      height: '1px',
      width: '100%',
      background: color,
      position: 'absolute',
      left: '0',
      top: `${topPx}px`
    });

    return element;
  }
}

interface IRenderFrame { startPositionMs: number; element: HTMLDivElement; }