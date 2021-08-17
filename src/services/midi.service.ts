import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class MIDIService {
    public inputs$ = new BehaviorSubject<any[]>([]);
    public key$ = new Subject<{ input: 'MIDI' | 'keyboard'; data: string | number[]; }>();
    constructor() {
        this.initializeKeyboard();
        this.initializeMIDI();
    }
    private async initializeKeyboard() {
        document.addEventListener('keydown', event => {
            this.key$.next({ input: 'keyboard', data: event.code });
        });
    }
    private async initializeMIDI() {
        const access = await (navigator as any).requestMIDIAccess();

        if (access) {
            const inputs = [...access.inputs.values()];

            for (const input of inputs) {
                input.onmidimessage = this.handleMIDIMessage.bind(this);
            }

            access.onstatechange = (event: any) => {
                console.log({ event });
                if (event.port?.type === 'input') {
                    event.port.onmidimessage = this.handleMIDIMessage.bind(this);
                }
            };
        }
    }
    private handleMIDIMessage(event: any) {
        console.log(event);
        this.key$.next({ input: 'MIDI', data: event.data });
    }
}
