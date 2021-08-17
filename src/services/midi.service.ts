import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class MIDIService {
    public inputs$ = new BehaviorSubject<any[]>([]);
    public key$ = new Subject<number[]>();
    constructor() {
        this.initializeMIDI();
    }
    private async initializeMIDI() {
        const access = await (navigator as any).requestMIDIAccess();

        if (access) {
            const inputs = [...access.inputs.values()];

            for (const input of inputs) {
                input.onmidimessage = this.handleMIDIMessage.bind(this);
            }

            access.onstatechange = (event: any) => {
                this.inputs$.next([...access.inputs.values()]);
                if (event.port?.type === 'input') {
                    event.port.onmidimessage = this.handleMIDIMessage.bind(this);
                }
            };
        }
    }
    private handleMIDIMessage(event: any) {
        console.log(event);
        this.key$.next(event.data);
    }
}
