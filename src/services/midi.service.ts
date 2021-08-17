import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MIDIService {
    public inputs$ = new BehaviorSubject<any[]>([]);
    constructor() {
        console.log('midi')
        this.initialize();
    }
    private async initialize() {
        const access = await (navigator as any).requestMIDIAccess();
        console.log({ access })

        if (access) {
            const inputs = [...access.inputs.values()];
            console.log({ inputs });
            access.onstatechange = (event: any) => {
                console.log({ event });
            };
        }
    }
}
