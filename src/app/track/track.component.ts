import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { equal, fraction, Fraction } from 'mathjs';
import { SpotifyPlayer } from 'src/common/classes/SpotifyPlayer';
import assignCss from 'src/common/fn/assignCss';
import { KeymapService } from 'src/services/keymap.service';
import { ISpotifyTrackAnalysis } from 'src/services/spotify.service';
import { ChartsService, INote } from './charts.service';

@UntilDestroy()
@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
  providers: [ChartsService]
})
export class TrackComponent implements OnInit, OnDestroy {
  private get frameDurationMs() { return this.viewportTimeMs * this.FRAME_SIZE; }
  private get frameHeightPx() { return this.viewportHeightPx * this.FRAME_SIZE; }
  private get viewportHeightPx() { return this.getTrack().clientHeight; }
  private get viewportWidthPx() { return this.getTrack().clientWidth; }
  public isEditMode = true;
  public isDevMode = true;
  public notesBetweenBeats = 3;
  public inputThresholdMs = 150;
  public viewportTimeMs = 3000; // Viewport height is a 5 second distance
  private readonly FRAME_SIZE = 2; // 2x viewport duration
  private isPanning = false;
  private panStartY!: number;
  private panStartMs!: number;
  @Output() public delayMs = new EventEmitter<number>();
  @HostBinding('tabindex') public tabindex = 0;
  @Input() public trackId!: string;
  @Input() public player!: SpotifyPlayer;
  @Input() public analysis!: ISpotifyTrackAnalysis;
  private nowEl = document.createElement('div');
  private isDead = false;
  private frameResuestId?: number;
  private frameStack = [] as IRenderFrame[];
  private lastPositionMs?: number;
  constructor(
    private elementRef: ElementRef,
    private charts: ChartsService,
    private keymap: KeymapService
  ) {
    Object.assign(window, { track: this });
  }
  @HostListener('dblclick')
  private onDoubleClick() {
    this.player.togglePlay();
  }
  public onScroll(event: Event) {
    const deltaMs = .15 * this.viewportTimeMs;

    if (this.lastPositionMs !== undefined) {
      if ((event as WheelEvent).deltaY > 0) {
        this.player.seek(this.lastPositionMs - deltaMs);
      } else {
        this.player.seek(this.lastPositionMs + deltaMs);
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
  private getTrack() {
    return this.elementRef.nativeElement.children[0] as HTMLDivElement;
  }
  public ngOnDestroy(): void {
    this.isDead = true;

    if (this.frameResuestId !== undefined) {
      cancelAnimationFrame(this.frameResuestId);
    }
  }
  public ngOnInit(): void {
    this.keymap.key$.pipe(untilDestroyed(this)).subscribe(async ({ notes }) => {
      console.log(notes);

      if (this.player.isPlaying$.getValue()) {
        const { position } = await this.player.getCurrentState();
        const positionMinMs = position - this.inputThresholdMs;
        const positionMaxMs = position + this.inputThresholdMs;
        // Find all note within threshold bounds
        const notesInThreshold = this.getNotesInTimeRange(positionMinMs, positionMaxMs);
        console.log(notesInThreshold);

        // Find match starting from oldest
        const match = notesInThreshold.sort((a, b) => a.noteStartMs - b.noteStartMs).find(o => notes.find(n =>
          n.noteId === o.noteId &&
          Boolean(n.isAlt) === Boolean(o.alt) // @todo Remove Boolean when alt is required
        ));

        if (match) {
          // @todo Spend it

          // Reflect in UI
          const { n, d } = fraction(match.divisions, match.lineIndex) as { n: number; d: number; };
          const momentId = [match.beatIndex, n, d].join();
          const element = this.elementRef.nativeElement.querySelector(`[momentId="${momentId}"] [noteId="${match.noteId}"]`);

          if (element) {
            element.style.background = 'cyan';
          }
        } else {
          // @todo Punish no match
        }
      }
    });
    this.charts.setTrackId(this.trackId);
    this.addNowBar();
    this.loop();
  }
  public removeFrames() {
    [...this.frameStack].forEach(this.removeFrame.bind(this));
  }
  private getNotesInTimeRange(startMs: number, endMs: number) {
    const notes = [] as Array<INote & { noteStartMs: number; }>;

    for (const beat of this.analysis.beats) {
      const index = this.analysis.beats.indexOf(beat);

      if (index) {
        const prevBeat = this.analysis.beats[index - 1];
        const beatStartMs = prevBeat.start * 1e3;
        const beatEndMs = beat.start * 1e3;
        if (this.isOverlap([beatStartMs, beatEndMs], [startMs, endMs])) {
          const beatNotes = this.charts.getBeat(index);
          const beatDurationMs = beatEndMs - beatStartMs;
          for (const note of beatNotes) {
            const divisionsMs = beatDurationMs / note.divisions;
            const noteStartMs = beatStartMs + (divisionsMs * note.lineIndex);

            if (this.isOverlap([startMs, endMs], [noteStartMs, noteStartMs])) {
              notes.push({ ...note, noteStartMs });
            }
          }
        } else if (notes.length) {
          break;
        }
      }
    }

    return notes;
  }
  private addNowBar() {
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
  private loop() {
    this.frameResuestId = requestAnimationFrame(async (time) => {
      const state = this.isPanning ? { position: this.lastPositionMs as number } : await this.player.getCurrentState();

      if (state) {
        const { position: positionMs } = state;

        if (this.lastPositionMs !== undefined) {
          const deltaMs = positionMs - this.lastPositionMs;
          if (deltaMs < 0) {
            console.log('negative delta', deltaMs);
          }
        }

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
  private removeNewestFramesIfNeeded(currentPositionMs: number) {
    const frameThatContainsNow = this.getFrameAtPosition(currentPositionMs);

    if (!frameThatContainsNow) {
      this.removeFrames();
    }
  }
  private getFrameAtPosition(positionMs: number) {
    return this.frameStack.find(o => o.startPositionMs <= positionMs && o.startPositionMs + this.frameDurationMs >= positionMs);
  }
  private updateFramePositions(currentPositionMs: number) {
    for (const frame of this.frameStack) {
      const topPx = this.calculateFrameTopPx(frame.startPositionMs, currentPositionMs);
      assignCss(frame.element, { top: `${topPx}px` });
    }
  }
  private calculateFrameTopPx(frameStartPositionMs: number, currentPositionMs: number) {
    const fromNowMs = frameStartPositionMs - currentPositionMs;
    const fromNowPx = this.msToPx(fromNowMs);
    return this.viewportHeightPx - this.frameHeightPx - fromNowPx - (this.viewportHeightPx * .25);
  }
  private msToPx(ms: number) {
    const pxpms = this.viewportHeightPx / this.viewportTimeMs;
    return ms * pxpms;
  }
  private pxToMs(px: number) {
    const msppx = this.viewportTimeMs / this.viewportHeightPx;
    return px * msppx;
  }
  private removeOldestFramesIfNeeded(currentPositionMs: number) {
    const firstFrame = this.frameStack[0];

    if (firstFrame?.startPositionMs < currentPositionMs - this.frameDurationMs * this.FRAME_SIZE) {
      this.removeFrame(firstFrame);
      this.removeOldestFramesIfNeeded(currentPositionMs);
    }
  }
  private removeFrame(frame: IRenderFrame) {
    frame.element.remove();
    this.frameStack.splice(this.frameStack.indexOf(frame), 1);
  }
  private pushNextFrameIfNeeded(currentPositionMs: number) {
    const lastFrame = this.frameStack[this.frameStack.length - 1];

    if (!lastFrame || lastFrame.startPositionMs < currentPositionMs) {
      this.pushNextFrame(currentPositionMs);
    }
  }
  private isOverlap(x: [number, number], y: [number, number]) {
    return x[0] <= y[1] && y[0] <= x[1];
  }
  private pushNextFrame(currentPositionMs: number) {
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
  private addSegmentCanvas(frame: IRenderFrame) {
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
  private addBeats(frame: IRenderFrame) {
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
        if (index) {
          const prevBeat = this.analysis.beats[index - 1];
          const beatWindow = {
            relativeStartMs: (prevBeat.start * 1e3) - frame.startPositionMs,
            relativeEndMs: (beat.start * 1e3) - frame.startPositionMs,
            get durationMs() { return beatWindow.relativeEndMs - beatWindow.relativeStartMs; }
          };
          const divisions = this.notesBetweenBeats + 1;
          const renderedLineTimes = [] as Fraction[];

          if (this.isEditMode) {
            let editLines = divisions;
            while (editLines--) {
              const lineIndex = editLines + 1;
              const noteLineEl = this.createNoteLine(
                lineIndex,
                divisions,
                index,
                beatWindow.durationMs,
                beatWindow.relativeStartMs
              );
              frame.element.appendChild(noteLineEl);
              renderedLineTimes.push(this.charts.getLineTime(divisions, lineIndex));
            }
          }

          const beatNotes = this.charts.getBeat(index);
          for (const note of beatNotes) {
            const noteTime = this.charts.getLineTime(note.divisions, note.lineIndex);
            const renderedTime = renderedLineTimes.find(o => equal(o, noteTime));

            if (!renderedTime) {
              const noteLineEl = this.createNoteLine(
                note.lineIndex,
                note.divisions,
                index,
                beatWindow.durationMs,
                beatWindow.relativeStartMs
              );
              frame.element.appendChild(noteLineEl);
              renderedLineTimes.push(this.charts.getLineTime(note.divisions, note.lineIndex));
            }
          }
        }
      } else {
        break;
      }
    }
  }
  private createNoteLine(
    lineIndex: number,
    divisions: number,
    beatIndex: number,
    beatDurationMs: number,
    beatRelativeStartMs: number
  ) {
    const lineIntervalMs = beatDurationMs / divisions;
    const relativeEditLineStartMs = beatRelativeStartMs + (lineIntervalMs * lineIndex);
    const editLineStartPx = this.frameHeightPx - this.msToPx(relativeEditLineStartMs);
    const editLineEl = this.createLineElement({
      color: this.isEditMode ? '#1a2439' : 'transparent',
      topPx: editLineStartPx,
      classes: ['flex', 'flex-row', 'justify-center', 'gap-6', 'text-xxs']
    });

    const { n, d } = fraction(divisions, lineIndex) as { n: number; d: number; };
    const momentId = [beatIndex, n, d].join();

    editLineEl.setAttribute('momentId', momentId);

    if (this.isDevMode) {
      editLineEl.innerHTML = beatIndex.toString();
    }

    for (const note of [
      { id: 'kick', color: '#202d49', width: '3%' },
      { id: 'snare', color: 'red', width: '10%' },
      { id: 'hihat', color: 'yellow', width: '10%' },
      { id: 'hightom', color: 'orange', width: '10%' },
      { id: 'lowtom', color: 'blue', width: '10%' },
      { id: 'crash', color: 'green', width: '10%' }
    ]) {
      const noteEl = document.createElement('div');
      const noteRecord = {
        beatIndex,
        noteId: note.id,
        divisions,
        lineIndex
      } as INote;

      noteEl.classList.add('rounded-full', 'opacity-10', 'hover:opacity-75', 'cursor-pointer');
      noteEl.setAttribute('noteId', note.id);

      const kickBoxShadow = '0 0 0 2px #202d49';
      const isOn = this.charts.findNote(noteRecord);

      assignCss(noteEl, {
        width: note.width,
        height: '20px',
        marginTop: '-10px',
        background: note.color,
        opacity: isOn ? '1' : this.isEditMode ? '' : '0'
      });

      if (isOn && note.id === 'kick') {
        editLineEl.style.boxShadow = kickBoxShadow;
      }

      noteEl.addEventListener('click', () => {
        const wasOn = noteEl.style.opacity === '1';

        if (wasOn) {
          noteEl.style.opacity = '';
          this.charts.removeNote(noteRecord);

          if (note.id === 'kick') {
            editLineEl.style.boxShadow = '';
          }
        } else {
          noteEl.style.opacity = '1';
          this.charts.upsertNote(noteRecord);

          if (note.id === 'kick') {
            editLineEl.style.boxShadow = kickBoxShadow;
          }
        }
      });
      editLineEl.appendChild(noteEl);
    }

    editLineEl.setAttribute('start', relativeEditLineStartMs.toString());
    editLineEl.setAttribute('divisions', divisions.toString());
    editLineEl.setAttribute('lineIndex', lineIndex.toString());
    editLineEl.setAttribute('beat', beatIndex.toString());

    return editLineEl;
  }
  private getNextFrameStartPositionMs(currentPositionMs: number) {
    const lastFrame = this.frameStack[this.frameStack.length - 1];
    let startPositionMs = currentPositionMs - (this.viewportTimeMs * .25);

    if (lastFrame) {
      startPositionMs = lastFrame.startPositionMs + this.frameDurationMs + 1;
    }

    return startPositionMs;
  }
  private createLineElement(options: {
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
