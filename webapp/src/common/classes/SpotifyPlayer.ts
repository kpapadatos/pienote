import { BehaviorSubject } from 'rxjs';

export class SpotifyPlayer {
    public ready!: Promise<void>;
    public deviceId!: string;
    public isPlaying$ = new BehaviorSubject(false);
    private player = new (window as any).Spotify.Player({
        name: "PieNote Player",
        getOAuthToken: (cb: (accessToken: string) => void) => {
            cb(this.accessToken);
        },
    });
    constructor(private accessToken: string) {
        Object.assign(window, { player: this.player });
        this.player.connect();
        this.ready = new Promise(resolve => {
            this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
                this.deviceId = device_id;
                resolve();
            });
        });
        this.player.addListener('player_state_changed', (state: any) => {
            if (!state) {
                return;
            }

            const isPlaying = !state.paused && !state.loading;

            if (isPlaying !== this.isPlaying$.getValue()) {
                this.isPlaying$.next(isPlaying);
            }
        });
        this.player.addListener("initialization_error", ({ message }: { message: string }) => {
            console.error(message);
        });
        this.player.addListener("authentication_error", ({ message }: { message: string }) => {
            console.error(message);
        });
        this.player.addListener("account_error", ({ message }: { message: string }) => {
            console.error(message);
        });
        this.player.addListener("playback_error", ({ message }: { message: string }) => {
            console.error(message);
        });
        this.player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
            console.log("Device ID has gone offline", device_id);
        });
    }
    public dispose() {
        this.player.disconnect();
    }
    public async togglePlay() {
        await this.player.togglePlay();
    }
    public async seek(ms: number) {
        await this.player.seek(ms);
    }
    public async pause() {
        await this.player.pause();
    }
    public async getCurrentState() {
        return await this.player.getCurrentState() as { position: number; duration: number; };
    }
}

export async function createSpotifyPlayer(accessToken: string) {
    await (window as any)._spotifyReady;
    const player = new SpotifyPlayer(accessToken);
    await player.ready;
    return player;
}