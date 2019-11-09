import moment = require('moment');

const play = require('audio-play');
const load = require('audio-loader');
const context = require('audio-context')()

export default class Metronome {
    private static clickSoundFile = './audio/metronome/click.wav';
    private static countSoundFile = './audio/metronome/count.wav';
    private clickAudioPCM: Buffer;
    private countAudioPCM: Buffer;
    private isPlaying = false;
    private ready: Promise<any>;
    private get beatIntervalMs() {
        return 60e3 / this.bpm;
    }
    private intervalRef: NodeJS.Timeout;

    constructor(
        public timeSignature = [4, 4],
        public countNote = 4,
        public bpm = 120) {
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
        const measureSize = this.timeSignature[0] * (note / this.timeSignature[1]);
        let noteCount = 1;
        this.intervalRef = setInterval(() => {
            if (noteCount % measureSize === 0) {
                this.count();
            }

            if (noteCount % (this.countNote / note) === 0) {
                this.click();
            }

            noteCount++;
        }, this.beatIntervalMs / (note / this.timeSignature[1]));
    }

    private loadAudioFiles() {
        this.ready = Promise.all([
            load(Metronome.clickSoundFile).then((audioBuffer: Buffer) => {
                this.clickAudioPCM = audioBuffer;
            }),
            load(Metronome.countSoundFile).then((audioBuffer: Buffer) => {
                this.countAudioPCM = audioBuffer;
            })
        ]);
    }

    private click() {
        play(this.clickAudioPCM, {
            context,
            start: .01
        });
    }

    private count() {
        play(this.countAudioPCM, {
            context,
            start: .04
        });
    }
}
