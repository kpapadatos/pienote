import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject } from 'rxjs';
import { KeyboardService } from './keyboard.service';
import { MIDIService } from './midi.service';

@UntilDestroy()
@Injectable()
export class KeymapService {
    private readonly keymapKey = 'keymap';
    private keymap = this.getKeymap();
    private key$ = new Subject<{ noteIds: string[]; }>();
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
            return {};
        }
    }
    private isMIDIEqual(a: MIDISignal, b: MIDISignal) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    }
}

export interface IKeymap {
    [noteId: string]: {
        keyboard: string[];
        midi: MIDISignal[];
    };
}

export type MIDISignal = [number, number, number];
