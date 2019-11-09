import { getInputs, Input } from 'easymidi';
import * as express from 'express';
import { createReadStream, readFileSync } from 'fs';
import { createServer } from 'http';
import * as WebSocket from 'ws';
import { NoteOnMessage } from '../interfaces/EasyMIDI';
import Metronome from './Metronome';

const play = require('audio-play');
const load = require('audio-loader');


export default class Application {
    public static start() {
        return new Application();
    }

    private app = express();
    private server = createServer(this.app);
    private wsServer: WebSocket.Server;
    private socket: WebSocket;
    private snareAudioFile = './client/src/assets/audio/kits/Kit 1 - Acoustic close/CYCdh_K1close_Snr-01.wav';
    private snareAudioPCM: Buffer;
    private snarePlayOptions: any;
    private midiInputDevices = getInputs();
    private midiInput = new Input(this.midiInputDevices[0]);
    private metronome = new Metronome();

    constructor() {
        this.server.listen(8000);

        this.wsServer = new WebSocket.Server({ server: this.server });
        this.wsServer.on('connection', (socket, request) => {
            this.socket = socket;
        });

        load(this.snareAudioFile).then((audioBuffer: Buffer, playOptions: any) => {
            this.snareAudioPCM = audioBuffer;
            this.snarePlayOptions = playOptions;
        });

        this.metronome.start();

        this.midiInput.on('message', (message: NoteOnMessage) => {
            if (message._type) {
                console.log(message);
            }
            if (message._type === 'noteon') {
                play(this.snareAudioPCM, this.snarePlayOptions);

                const binData = new Int8Array(3);
                binData[0] = message.channel;
                binData[1] = message.note;
                binData[2] = message.velocity;

                // console.log('play');
                if (this.socket) {
                    this.socket.send(binData);
                }
            }
        });
    }
}
