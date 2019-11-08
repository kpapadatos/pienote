import { getInputs, Input } from 'easymidi';
import * as express from 'express';
import { NoteOnMessage } from '../interfaces/EasyMIDI';

export default class Application {
    public static start() {
        return new Application();
    }

    private app = express();

    constructor() {
        // const inputDevices = getInputs();
        // const input = new Input(inputDevices[0]);

        // input.on('message', (message: NoteOnMessage) => {
        //     console.log(message);
        // });
    }
}
