// import { getInputs, Input } from 'easymidi';
import * as express from 'express';
import { createReadStream, readFileSync } from 'fs';
import { createServer } from 'http';
import * as WebSocket from 'ws';
// import { NoteOnMessage } from '../interfaces/EasyMIDI';
import Metronome from './Metronome';

export default class Application {
    public static start() {
        return new Application();
    }

    private app = express();
    private server = createServer(this.app);
    private wsServer: WebSocket.Server;
    private socket: WebSocket;
    // private midiInputDevices = getInputs();
    // private midiInput = new Input(this.midiInputDevices[0]);
    private metronome = new Metronome();

    constructor() {
        this.server.listen(8000);

        this.wsServer = new WebSocket.Server({ server: this.server });
        this.wsServer.on('connection', (socket, request) => {
            this.socket = socket;
        });

        this.app.use((req, res, next) => {
            res.setHeader('access-control-allow-origin', '*');
            next();
        });

        this.app.get('/api/metronome/:mode', (req, res) => {
            if (req.params.mode === 'on') {
                this.metronome.start();
            } else {
                this.metronome.stop();
            }

            res.end(this.metronome.intervalMs.toString());
        });

        // this.midiInput.on('message', (message: NoteOnMessage) => {
        //     if (message._type) {
        //         console.log(message);
        //     }

        //     if (message._type === 'noteon') {
        //         this.socket.send(message);
        //     }
        // });
    }
}
