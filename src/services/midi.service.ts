import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class MIDIService {
    public inputs$ = new BehaviorSubject<any[]>([]);
    public key$ = new Subject<{ input: 'MINI' | 'keyboard', data: number[] }>();
    constructor() {
        this.initialize();
    }
    private async initialize() {
        const access = await (navigator as any).requestMIDIAccess();
        console.log({ access });

        if (access) {
            const inputs = [...access.inputs.values()];
            console.log({ inputs });
            access.onstatechange = (event: any) => {
                console.log({ event });
            };
        }
    }
}
