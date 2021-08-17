import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject } from 'rxjs';
import { KeyboardService } from './keyboard.service';
import { MIDIService } from './midi.service';

@UntilDestroy()
@Injectable()
export class KeymapService {
    private readonly keymapKey = 'keymap';
    public keymap = this.getKeymap();
    public key$ = new Subject<{ noteIds: string[]; }>();
    constructor(
        private midi: MIDIService,
        private keyboard: KeyboardService
    ) {
        midi.key$.pipe(untilDestroyed(this)).subscribe(message => {
            const noteIds = [] as string[];

            for (const [noteId, config] of Object.entries(this.keymap)) {
                if (config.midi.find(o => this.isMIDIEqual(o, message))) {
                    noteIds.push(noteId);
                }
            }

            if (noteIds.length) {
                this.key$.next({ noteIds });
            }
        });
        keyboard.key$.pipe(untilDestroyed(this)).subscribe(evt => {
            const event = evt as KeyboardEvent;
            const noteIds = [] as string[];

            for (const [noteId, config] of Object.entries(this.keymap)) {
                if (config.keyboard.find(o => o === event.code)) {
                    noteIds.push(noteId);
                }
            }

            if (noteIds.length) {
                this.key$.next({ noteIds });
            }
        });
    }
    public saveKeymap() {
        localStorage.setItem(this.keymapKey, JSON.stringify(this.keymap));
    }
    private getKeymap(): IKeymap {
        const keymapJson = localStorage.getItem(this.keymapKey);

        if (keymapJson) {
            return JSON.parse(keymapJson);
        } else {
            /*
            * 1st byte: open 153, close 157
            * 2nd byte:
            *   kick 36
            *   ride 51
            *   crash 55
            *   hightom 48
            *   closedhihat 42
            *   openhihat 26
            *   snare 38
            *   midtom 45
            *   lowtom 41
            * 3rd byte: velocity
            */
            return {
                kick: { midi: [[153, 36, 0]], keyboard: ['Space'] },
                snare: { midi: [[153, 38, 0]], keyboard: ['KeyC'] },
                hihat: { midi: [[153, 26, 0], [153, 42, 0]], keyboard: ['KeyM'] },
                hightom: { midi: [[153, 48, 0]], keyboard: ['KeyJ'] },
                lowtom: { midi: [[153, 41, 0]], keyboard: ['KeyK'] },
                crash: { midi: [[153, 55, 0]], keyboard: ['KeyL'] },
            };
        }
    }
    private isMIDIEqual(a: MIDISignal, b: MIDISignal) {
        return a[1] === b[1];
    }
}

export interface IKeymap {
    [noteId: string]: {
        keyboard: string[];
        midi: MIDISignal[];
    };
}

export type MIDISignal = [number, number, number];
