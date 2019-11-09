import moment = require('moment');

const play = require('audio-play');
const load = require('audio-loader');

export default class Metronome {
    private static clickSoundFile = './audio/metronome/click.wav';
    private static countSoundFile = './audio/metronome/count.wav';
    private clickAudioPCM: Buffer;
    private clickPlayOptions: any;
    private countAudioPCM: Buffer;
    private countPlayOptions: any;
    private isPlaying = false;
    private ready: Promise<any>;
    private get beatIntervalMs() {
        return 60e3 / this.bpm;
    }
    private get intervalMs() {
        return this.beatIntervalMs * (this.timeSignature[1] / this.countNote);
    }
    private intervalRef: NodeJS.Timeout;

    constructor(
        public timeSignature = [2, 8],
        public countNote = 4,
        public bpm = 80) {
        this.loadAudioFiles();
    }

    public async start() {
        if (this.isPlaying) {
            return;
        }

        await this.ready;
        this.isPlaying = true;

        this.startInterval();
    }

    public stop() {
        clearInterval(this.intervalRef);
        this.intervalRef.unref();
    }

    private startInterval() {
        const note = Math.max(this.countNote, this.timeSignature[1]);
        const measureSize = (this.timeSignature[0] * this.timeSignature[1]) * (this.timeSignature[0] / note);
        let noteCount = 1;
        this.intervalRef = setInterval(() => {
            if (this.countNote >= this.timeSignature[1]) {
                this.click();
            } else { }

            if (noteCount % measureSize === 1) {
                // this.count();
            }
            noteCount++;
        }, this.intervalMs);
    }

    private loadAudioFiles() {
        this.ready = Promise.all([
            load(Metronome.clickSoundFile).then((audioBuffer: Buffer, playOptions: any) => {
                this.clickAudioPCM = audioBuffer;
                this.clickPlayOptions = playOptions;
            }),
            load(Metronome.countSoundFile).then((audioBuffer: Buffer, playOptions: any) => {
                this.countAudioPCM = audioBuffer;
                this.countPlayOptions = playOptions;
            })
        ]);
    }

    private click() {
        play(this.clickAudioPCM, this.clickPlayOptions);
    }

    private count() {
        play(this.countAudioPCM, this.countPlayOptions);
    }
}
